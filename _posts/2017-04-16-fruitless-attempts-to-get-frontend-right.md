---
layout: home
title: Fruitless attempts to get the FrontEnd right
tags:
  - jQuery
  - CSS
  - Semantic UI
  - mobile
---

## Why?
Received a kind notification from Google about my account being inactive on some pages. Erm, okay..
Decided to do some button pressing this day.
Then dived into too deep and started fiddling with website itself.
Especially never used nor seen jquerymobile thingy and figuring out "why you semantic-ui don't provide collapsing menu, huh?"

## jQuery mobile thingy

My approach to available technology is simple: what's there? Let's grab the latest the greatest. Why not?
So I see in [Google's Hosted Libraries](https://developers.google.com/speed/libraries/) I can grab jQuery 3.2.1 and jQuery mobile - 1.4.5.
Great stuff. Let's do this. First rookie mistake: you **need** jQuery AND jQuery mobile loaded together. Took a while to overcome this thought.

Next is just version compatibility. Should've just copied from release notes:

{% highlight html %}
<link rel="stylesheet" href="//ajax.googleapis.com/ajax/libs/jquerymobile/1.4.5/jquery.mobile.min.css">
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
<script src="//ajax.googleapis.com/ajax/libs/jquerymobile/1.4.5/jquery.mobile.min.js"></script>
{% endhighlight %}

Oh yea, you need that css too.

### Look out

Since I am doing bunch of async calls as well (why not?) and have other libraries using jQuery, it comes as a problem how to load what.
Even jQuery mobile library race-conditioned to load with jQuery. Had to do some of these intervals:

{% highlight js %}
var intervalMobile = setInterval(function() {
  if (window.$) {
    loadScript('//ajax.googleapis.com/ajax/libs/jquerymobile/1.4.5/jquery.mobile.min.js');
    clearInterval(intervalMobile);
  }
}, 100);
{% endhighlight %}

If you use any other preloaded functionality - best to keep that in mind.
Or you are smart boy and doing proper javascript with prototypes or what. Some years ago I heard that's the way.

## Semantic-ui collapsing menu

Odd thing to remove. I'll cut to the case. You obviously will need to deal with viewports in CSS.

{% highlight html %}
<div class="ui inverted vertical accordion borderless menu mobile only">
  <div class="item">
    <a class="title">
      <i class="dropdown icon"></i>
      <img class="ui avatar image" rel="shortcut icon" src="/assets/favicon.ico"/>
      <span>Donatas</span>
    </a>
    <div class="content">
      <a class="{% if include.active == "index.html" %}active {% endif %}item" href="{% link index.html %}">Home</a>
      <a class="{% if include.active == "cv.html" %}active {% endif %}item" href="{% link cv.html %}">CV</a>
      <a class="{% if include.active == "projects.html" %}active {% endif %}item" href="{% link projects.html %}">Projects</a>
      <a class="{% if include.active == "posts.html" or include.activeExtra == "_post" %}active {% endif %}item" href="{% link posts.html %}">Posts</a>
    </div>
  </div>
  <div class="item">
    <a class="ui primary button" href="//github.com/doncem" target="_blank">GitHub</a>
  </div>
</div>
{% endhighlight %}

{% highlight css %}
/* Mobile */

@media only screen and (max-width: 767px) {
  [class*="mobile hidden"],
  [class*="tablet only"]:not(.mobile),
  [class*="computer only"]:not(.mobile),
  [class*="large monitor only"]:not(.mobile),
  [class*="widescreen monitor only"]:not(.mobile),
  [class*="or lower hidden"] {
    display: none !important;
  }
}


/* Tablet / iPad Portrait */

@media only screen and (min-width: 768px) and (max-width: 991px) {
  [class*="mobile only"]:not(.tablet),
  [class*="tablet hidden"],
  [class*="computer only"]:not(.tablet),
  [class*="large monitor only"]:not(.tablet),
  [class*="widescreen monitor only"]:not(.tablet),
  [class*="or lower hidden"]:not(.mobile) {
    display: none !important;
  }
}


/* Computer / Desktop / iPad Landscape */

@media only screen and (min-width: 992px) and (max-width: 1199px) {
  [class*="mobile only"]:not(.computer),
  [class*="tablet only"]:not(.computer),
  [class*="computer hidden"],
  [class*="large monitor only"]:not(.computer),
  [class*="widescreen monitor only"]:not(.computer),
  [class*="or lower hidden"]:not(.tablet):not(.mobile) {
    display: none !important;
  }
}


/* Large Monitor */

@media only screen and (min-width: 1200px) and (max-width: 1919px) {
  [class*="mobile only"]:not([class*="large monitor"]),
  [class*="tablet only"]:not([class*="large monitor"]),
  [class*="computer only"]:not([class*="large monitor"]),
  [class*="large monitor hidden"],
  [class*="widescreen monitor only"]:not([class*="large monitor"]),
  [class*="or lower hidden"]:not(.computer):not(.tablet):not(.mobile) {
    display: none !important;
  }
}


/* Widescreen Monitor */

@media only screen and (min-width: 1920px) {
  [class*="mobile only"]:not([class*="widescreen monitor"]),
  [class*="tablet only"]:not([class*="widescreen monitor"]),
  [class*="computer only"]:not([class*="widescreen monitor"]),
  [class*="large monitor only"]:not([class*="widescreen monitor"]),
  [class*="widescreen monitor hidden"],
  [class*="widescreen monitor or lower hidden"] {
    display: none !important;
  }
}
{% endhighlight %}

Then with a simple additional rule for non mobile devices you menus are changing!:

{% highlight html %}
<div class="ui inverted stackable container menu mobile or lower hidden">
{% endhighlight %}

## ..and it took me good portion of day

Started with just some clicks around and look where it got me. Trying to make it "nicer" :/

Result is good though. Accordion working. Menus changing. Site optimised a bit. jQuery mobile in use.

Urgh.. the latter. Some CSS is disturbingly wrong on mobile devices now :(
