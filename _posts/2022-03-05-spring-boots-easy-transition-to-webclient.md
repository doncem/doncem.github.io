---
layout: home
title: "Converting Feign client to WebClient"
tags:
  - Java
  - Spring Boot
---

## Intro
Last days I've been struggling to accomplish one task at hand.
The project I'm working on had old Spring Boot version and desired an upgrade.
Not only that you know.
Other dependencies and setup.
So it had to happen someday.

Been pushing this for a while but only now had a chance to do this transition.
It was a good challange.
Struggle happened with every microservice but handled _okilie_.
There was one battle though.
Hence this post.
Internet did not help practically at all or sort of helped.
I'm helping you with the solution that worked out for our company

## Problem

We have such setup that usage of Feign client was no longer an option.
Authorisation service upgraded as well and it was migrate or die - had to do it.

So internal clients worked out fine.
Had couple "oops"es but worked them out.
And then, surprisingly, came to one service which comunicates to third party via some rest template setup.
I say _surprisingly_ with a sense that out of all microservices we have - it was just this single one with a problem.
And oh boy I had a problem.

So here is a problem (situation before):

- Using OAuth2RestTemplate which got deprecated and removed
- Client credentials stored and managed in another microservice. So WebClient had to be dynamically created

## Solution

I'll just go straight to solution.
Because who reads that much text?
I sure hate it too.
Need a solution asap.

Components, setup, ideas, w/e - up to developers, but I'll just copy solution how I handled it.
Oh, almost forgot, there was a problem with auth token as well so there had to be workaround on that matter too.
Also - painful.
I'll save you.

P.S. POJO things are omitted intentionally.

### Custom oauth2 token response

```java
public class AuthTokenResponse {

    private final String accessToken;

    private final long expiresIn;

    private final String refreshToken;

    public AuthTokenResponse(
        @JsonProperty("access_token") String accessToken,
        @JsonProperty("expires_in") long expiresIn,
        @JsonProperty("refresh_token") String refreshToken
        // among others but those ^ are most important
    ) {
        this.accessToken = accessToken;
        this.expiresIn = expiresIn;
        this.refreshToken = refreshToken;
    }
}
```

### Custome access token response client

```java
public class AccessTokenResponseClient implements ReactiveOAuth2AccessTokenResponseClient<OAuth2ClientCredentialsGrantRequest> {

    private final WebClient webClient;

    public AccessTokenResponseClient() {
        this.webClient = WebClient.builder().build();
    }

    @Override
    public Mono<OAuth2AccessTokenResponse> getTokenResponse(OAuth2ClientCredentialsGrantRequest grantRequest) {
        Assert.notNull(grantRequest, "grantRequest cannot be null");

        return this.webClient
            .post()
            .uri("uri")
            .headers(this::populateTokenRequestHeaders)
            .body(this.createTokenRequestBody(grantRequest))
            .exchangeToMono(this::readTokenResponse);
    }

    // external client's implementation
    private void populateTokenRequestHeaders(HttpHeaders headers) {
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
    }

    // standard body when you have form urlencoded content type
    private BodyInserters.FormInserter<String> createTokenRequestBody(OAuth2ClientCredentialsGrantRequest grantRequest) {
        ClientRegistration clientRegistration = grantRequest.getClientRegistration();

        return BodyInserters
            .fromFormData("grant_type", grantRequest.getGrantType().getValue())
            .with("client_id", clientRegistration.getClientId())
            .with("client_secret", clientRegistration.getClientSecret());
    }

    // non-compliant bocy which had to be mapped customly
    private Mono<OAuth2AccessTokenResponse> readTokenResponse(ClientResponse clientResponse) {
        return clientResponse
            .bodyToMono(AuthTokenResponse.class)
            .map(tokenResponse -> OAuth2AccessTokenResponse
                .withToken(tokenResponse.getAccessToken())
                .expiresIn(tokenResponse.getExpiresIn())
                .refreshToken(tokenResponse.getRefreshToken())
                .tokenType(OAuth2AccessToken.TokenType.BEARER)
                .scopes(Set.of())
                .build()
            );
    }
}
```

### Custom client config via spring boot

```java
public class WebClientConfig {

    @Bean("auth-client-provider")
    public ReactiveOAuth2AuthorizedClientProvider authClientProvider(
            AccessTokenResponseClient accessTokenResponseClient
    ) {
        ClientCredentialsReactiveOAuth2AuthorizedClientProvider oauth2ClientProvider
            = new ClientCredentialsReactiveOAuth2AuthorizedClientProvider();
        oauth2ClientProvider.setAccessTokenResponseClient(accessTokenResponseClient);

        return oauth2ClientProvider;
    }

    @Bean
    public BiFunction<String, String, WebClient> webClientProvider(
            HttpClient httpClient,
            @Qualifier("auth-client-provider")
            ReactiveOAuth2AuthorizedClientProvider authClientProvider
    ) {
        return (clientId, clientSecret) -> {
            ClientRegistration clientRegistration = ClientRegistration
                .withRegistrationId("external-api_" + clientId)
                .clientName("ExternalApi_" + clientId)
                .clientId(clientId)
                .clientSecret(clientSecret)
                .tokenUri("uri")
                // following are as per api. i had these ones ;)
                .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_POST)
                .build();

            ExchangeFilterFunction oauth2 = this.configureAuth(clientRegistration, authClientProvider);

            return WebClient
                .builder()
                .baseUrl("base-uri")
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .codecs(configurer -> configurer.defaultCodecs().enableLoggingRequestDetails(true))
                .filter(oauth2)
                .build();
        };
    }

    private ExchangeFilterFunction configureAuth(
        ClientRegistration clientRegistration,
        ReactiveOAuth2AuthorizedClientProvider authClientProvider
    ) {
        ReactiveClientRegistrationRepository clientRegistrationRepository = new InMemoryReactiveClientRegistrationRepository(
            clientRegistration
        );

        AuthorizedClientServiceReactiveOAuth2AuthorizedClientManager oauth2ClientManager =
            new AuthorizedClientServiceReactiveOAuth2AuthorizedClientManager(
                clientRegistrationRepository,
                new InMemoryReactiveOAuth2AuthorizedClientService(clientRegistrationRepository)
            );
        oauth2ClientManager.setAuthorizedClientProvider(authClientProvider);

        return new ServerOAuth2AuthorizedClientExchangeFilterFunction(oauth2ClientManager);
    }
}
```

### WebClient itself

And here's the grand finale:

```java
public class Client {

    private final BiFunction<String, String, WebClient> webClientProvider;

    public TheResponse getRespone(SomeRequest request) {
        WebClient webClient = this.getClient(request.getClientId());
        MultiValueMap<String, String> requestData = getRequestData(request);

        return webClient
            .post()
            .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED_VALUE)
            .bodyValue(requestData)
            .retrieve()
            .onStatus(HttpStatus::isError, this::parseWebClientError)
            .toEntity(String.class)
            .map(this::parseWebClientResponse)
            .flatMap(object -> {
                if (object instanceof TheResponse) {
                    return Mono.just((TheResponse) object);
                } else {
                    return Mono.error((Throwable) object);
                }
            })
            .block();
    }

    public WebClient getClient(UUID clientId) {
        WebClient client = this.cachedClients.get(clientId);

        if (client == null) {
            var clientDTO = clientCachedService.getClientById(clientId);

            client = this.webClientProvider.apply("client id", "client secret");
            this.cachedClients.put(clientId, client);
        }

        return client;
    }
}
```

Cache is a bonus suggestion.
Use as you wish
