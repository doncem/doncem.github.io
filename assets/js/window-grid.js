function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

(function() {
    const FX = {
        easing: {
            linear: function(progress) {
                return progress;
            },
            quadratic: function(progress) {
                return Math.pow(progress, 2);
            },
            swing: function(progress) {
                const nextProgress = function(currentProgress) {
                    return 0.5 - Math.cos(currentProgress * Math.PI) / 2;
                }

                return Array.isArray(progress) ? progress.map(function(e) { return nextProgress(e); }) : nextProgress(progress);
            },
            circ: function(progress) {
                return 1 - Math.sin(Math.acos(progress));
            },
            back: function(progress, x) {
                return Math.pow(progress, 2) * ((x + 1) * progress - x);
            },
            bounce: function(progress) {
                for (var a = 0, b = 1, result; 1; a += b, b /= 2) {
                    if (progress >= (7 - 4 * a) / 11) {
                        return -Math.pow((11 - 6 * a - 11 * progress) / 4, 2) + Math.pow(b, 2);
                    }
                }
            },
            elastic: function(progress, x) {
                return Math.pow(2, 10 * (progress - 1)) * Math.cos(20 * Math.PI * x / 3 * progress);
            }
        },
        animate: function(options) {
            const start = new Date;
            const id = setInterval(function() {
                const timePassed = new Date - start;
                let progress = timePassed / options.duration;
                if (progress > 1) {
                    progress = 1;
                }
                options.progress = progress;
                const delta = options.delta(progress);
                options.step(delta);
                if (progress == 1) {
                    clearInterval(id);
                    if (typeof(options.complete) == 'function') {
                        options.complete();
                    }
                }
            }, options.delay);
        },
        fadeOut: function(element, options) {
            const to = 1;
            this.animate({
                delay: options.delay || 10,
                duration: options.duration,
                delta: function(progress) {
                    progress = this.progress;
                    return FX.easing.swing(progress);
                },
                complete: options.complete,
                step: function(delta) {
                    element.style.opacity = to - delta;
                }
            });
        },
        fadeIn: function(element, options) {
            const to = 0;
            this.animate({
                delay: options.delay || 10,
                duration: options.duration,
                delta: function(progress) {
                    progress = this.progress;
                    return FX.easing.swing(progress);
                },
                complete: options.complete,
                step: function(delta) {
                    element.style.opacity = to + delta;
                }
            });
        },
        backgroundColor: function(element, newColor, options) {
            const rX = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
            const newResult = rX.exec(newColor);
            if (newResult) {
                const oldResult = rX.exec(element.style.backgroundColor) || rX.exec('#ffffff');
                this.animate({
                    delay: options.delay || 10,
                    duration: options.duration,
                    delta: function(progress) {
                        progress = this.progress;
                        return FX.easing.swing(progress);
                    },
                    complete: options.complete,
                    step: function(delta) {
                        element.style.backgroundColor = rgbToHex(
                            newResult[1] - oldResult[1] < 0 ? oldResult[1] - delta : oldResult[1] + delta,
                            newResult[2] - oldResult[2] < 0 ? oldResult[2] - delta : oldResult[2] + delta,
                            newResult[3] - oldResult[3] < 0 ? oldResult[3] - delta : oldResult[3] + delta,
                        );
                    }
                });
            }
        }
    };
    window.FX = FX;
})();

function toggleBrowserScrollbar(enable) {
    // let scrollPosition = [
    //     self.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
    //     self.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
    // ];

    // if (enable) {
    //     scrollPosition = document.body.dataset.scrollPosition;
    //     document.body.style.overflow = document.body.dataset.previousOverflow;
    // } else {
    //     document.body.dataset.scrollPosition = scrollPosition;
    //     document.body.dataset.previousOverflow = document.body.style.overflow;
    //     document.body.style.overflow = 'hidden';
    // }

    // window.scrollTo(scrollPosition[0], scrollPosition[1]);
    if (enable) {
        document.body.parentNode.style.overflow = 'auto';
        document.body.style.overflow = 'auto';
    } else {
        document.body.parentNode.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
    }
};

const gap = 4;

function calculateMax(wSize) {
    return Math.floor((wSize - gap) / (3 + gap));
};

function assignPx(size) {
    return size + 'px';
}

let windowGridParams = {
    xCurrent: 1,
    yCurrent: 1,
    xMax: calculateMax(window.innerWidth),
    yMax: calculateMax(window.innerHeight - (parseInt(document.body.style.paddingTop) || 0)),
    maxX: 1,
    maxY: 1,
    minX: 1,
    minY: 1
}

function getArrayOfClassedElements(className) {
    return [...document.getElementsByClassName(className)];
}

function windowGrid() {
    let c = document.getElementById('window-grid-container'),
        activeColour = '#012345',
        colour = '#543210';

    toggleBrowserScrollbar(false);
    const currentChildren = c.querySelectorAll('div');

    if (currentChildren.length > 1) {
        FX.fadeIn(c, {
            duration: 8000,
            complete: function() {
                FX.fadeIn(currentChildren, { delay: 400, duration: 2000 });
            }
        });
    } else {
        windowGridParams.xCurrent = 1,
        windowGridParams.yCurrent = 1,
        windowGridParams.xMax = calculateMax(window.innerWidth),
        windowGridParams.yMax = calculateMax(window.innerHeight - (parseInt(document.body.style.paddingTop) || 0)),
        windowGridParams.maxX = 1,
        windowGridParams.maxY = 1,
        windowGridParams.minX = 1,
        windowGridParams.minY = 1;

        c.style.width = assignPx(window.innerWidth);
        c.style.height = assignPx(window.innerHeight - (parseInt(document.body.style.paddingTop) || 0) + 1);// couldn't think of any border. there is a nav one, but..;
        c.style.paddingLeft = assignPx(gap);
        c.style.paddingTop = assignPx(gap);

        c.addEventListener('click', function(e) {
            if (e.target.classList.contains(this.className)) {
                this.childNodes.forEach(function(e) { FX.fadeOut(e, { duration: 2000 }); });
                FX.fadeOut(this, { duration: 4000 });
            }
        });

        FX.fadeIn(c, {
            duration: 8000,
            complete: function() {
                currentChildren.forEach(function(e) {
                    e.style.left = assignPx(gap);
                    e.style.top = assignPx(gap);
                    e.style.width = assignPx((parseInt(c.style.width) || 0) - (gap + 1));
                    e.style.height = assignPx((parseInt(c.style.height) || 0) - (gap +1));
                    e.style.backgroundColor = activeColour;
                    FX.fadeIn(e, { duration: 2000 });
                });
            }
        });
    }

    let xCurrent = windowGridParams.xCurrent,
        yCurrent = windowGridParams.yCurrent,
        xMax = windowGridParams.xMax,
        yMax = windowGridParams.yMax,
        maxX = windowGridParams.maxX,
        maxY = windowGridParams.maxY,
        minX = windowGridParams.minX,
        minY = windowGridParams.minY;

    function calculateSize(wSize, k) {
        return Math.floor((wSize - gap) / k - gap - 2 * (parseInt(document.getElementsByClassName("grid-element")[0].style.borderWidth) || 0));
    };

    /**
     * Add element to the grid
     * @param {string} type Where to add element: 'prepend' or 'append'
     * @param {int} w New width
     * @param {int} h New height
     * @param {int} t Position from top
     * @param {int} l Position from left
     */
    function addE(type, w, h, t, l) {
        let tmpElement = document.createElement('div');
        tmpElement.innerHTML = '<div id="grid-element-" class="grid-element" data-x="" data-y=""></div>';

        if (type === 'prepend') {
            c.insertBefore(tmpElement.firstChild, c.childNodes[0]);
        } else {
            c.appendChild(tmpElement.firstChild);
        }

        let element = document.getElementById('grid-element-');
        element.id = 'grid-element-' + xCurrent + '-' + yCurrent;
        element.dataset.x = xCurrent;
        element.dataset.y = yCurrent;
        element.style.top = t;
        element.style.left = l;
        // should animate
        element.style.height = assignPx(h + 2);
        element.style.width = assignPx(w + 2);
        // tiesiog fade in. manrods gerai bus
        FX.backgroundColor(element, activeColour, {
            duration: 2000
        });
            // .animate({
            //     width:w + 2,
            //     height:h + 2,
            //     top:t,
            //     left:l,
            //     backgroundColor:activeColour
            // }, "fast");
    };

    function close() {
        windowGridParams.xCurrent = xCurrent,
        windowGridParams.yCurrent = yCurrent,
        windowGridParams.xMax = xMax,
        windowGridParams.yMax = yMax,
        windowGridParams.maxX = maxX,
        windowGridParams.maxY = maxY,
        windowGridParams.minX = minX,
        windowGridParams.minY = minY;

        c.querySelectorAll('div').forEach(function(e) {
            FX.fadeOut(e, { delay: 400, duration: 2000 });
        });
        FX.fadeOut(c, { duration: 8000 });
        toggleBrowserScrollbar(true);
    };

    function moveLeft() {
        xCurrent--;
        // document.getElementById('grid-element-' + (xCurrent + 1) + '-' + yCurrent).animate({backgroundColor:colour}, "fast");
        FX.backgroundColor(document.getElementById('grid-element-' + (xCurrent + 1) + '-' + yCurrent), colour, {
            duration: 2000
        });

        if (document.getElementById('grid-element-' + xCurrent + '-' + yCurrent) != null) {
            // document.getElementById('grid-element-' + xCurrent + '-' + yCurrent).animate({backgroundColor:activeColour}, "fast");
            FX.backgroundColor(document.getElementById('grid-element-' + xCurrent + '-' + yCurrent), activeColour, {
                duration: 2000
            });
        } else {
            const column = getArrayOfClassedElements('grid-element').filter(function(e) {
                return e.dataset.x == xCurrent;
            });
            let line = getArrayOfClassedElements('grid-element').filter(function(e) {
                return e.dataset.y == yCurrent;
            });

            if (column.length > 0) {
                addE('prepend', parseInt(line[0].style.width) || 0, parseInt(line[0].style.height) || 0, (parseInt(line[0].style.top) || 0), (parseInt(column[0].style.left) || 0));
            } else {
                if (line.length < xMax) {
                    minX--;
                    const newX = calculateSize(parseInt(c.style.width) || 0, maxX - minX + 1);
                    getArrayOfClassedElements('grid-element').forEach(function(e) {
                        // $(e).animate({
                        //     left:(parseInt($(e).attr("data-x")) - xCurrent + 1) * gap + (parseInt($(e).attr("data-x")) - xCurrent) * (2 * parseInt($(".grid-element").first().css("border-width")) + newX),
                        //     width:newX
                        // }, "fast");
                    });
                    addE('prepend', newX, parseInt(line[0].style.height) || 0, parseInt(line[0].style.top) || 0, gap);
                } else {
                    // line.last.animate({backgroundColor:activeColour}, "fast");
                    FX.backgroundColor(line[line.length - 1], activeColour, {
                        duration: 2000
                    });
                    xCurrent = parseInt(line[line.length - 1].dataset.x) || 0;
                }
            }
        }
    };

    function moveUp() {
        yCurrent--;
        // document.getElementById('grid-element-' + xCurrent + '-' + (yCurrent + 1)).animate({backgroundColor:colour}, "fast");
        FX.backgroundColor(document.getElementById('grid-element-' + xCurrent + '-' + (yCurrent + 1)), colour, {
            duration: 2000
        });

        if (document.getElementById('grid-element-' + xCurrent + '-' + yCurrent) != null) {
            // document.getElementById('grid-element-' + xCurrent + '-' + yCurrent).animate({backgroundColor:activeColour}, "fast");
            FX.backgroundColor(document.getElementById('grid-element-' + xCurrent + '-' + yCurrent), activeColour, {
                duration: 2000
            });
        } else {
            let column = getArrayOfClassedElements('grid-element').filter(function(e) {
                return e.dataset.x == xCurrent;
            });
            const line = getArrayOfClassedElements('grid-element').filter(function(e) {
                return e.dataset.y == yCurrent;
            });

            if (line.length > 0) {
                addE('prepend', parseInt(line[0].style.width) || 0, parseInt(line[0].style.height) || 0, (parseInt(line[0].style.top) || 0), (parseInt(column[0].style.left) || 0));
            } else {
                if (column.length < yMax) {
                    minY--;
                    const newY = calculateSize(parseInt(c.style.height) || 0, maxY - minY + 1);
                    getArrayOfClassedElements('grid-element').forEach(function(e) {
                        // $(e).animate({
                        //     top:(parseInt($(e).attr("data-y")) - yCurrent + 1) * gap + (parseInt($(e).attr("data-y")) - yCurrent) * (2 * parseInt($(".grid-element").first().css("border-width")) + newY),
                        //     height:newY
                        // }, "fast");
                    });
                    addE('prepend', parseInt(column[0].style.width) || 0, newY, gap, (parseInt(column[0].style.left) || 0));
                } else {
                    // column.last.animate({backgroundColor:activeColour}, "fast");
                    FX.backgroundColor(column[column.length - 1], activeColour, {
                        duration: 2000
                    });
                    yCurrent = parseInt(column[column.length - 1].dataset.y) || 0;
                }
            }
        }
    };

    function moveRight() {
        xCurrent++;
        // document.getElementById('grid-element-' + (xCurrent - 1) + '-' + yCurrent).animate({backgroundColor:colour}, "fast");
        FX.backgroundColor(document.getElementById('grid-element-' + (xCurrent - 1) + '-' + yCurrent), colour, {
            duration: 2000
        });

        if (document.getElementById('grid-element-' + xCurrent + '-' + yCurrent) != null) {
            // document.getElementById('grid-element-' + xCurrent + '-' + yCurrent).animate({backgroundColor:activeColour}, "fast");
            FX.backgroundColor(document.getElementById('grid-element-' + xCurrent + '-' + yCurrent), activeColour, {
                duration: 2000
            });
        } else {
            const column = getArrayOfClassedElements('grid-element').filter(function(e) {
                return e.dataset.x == xCurrent;
            });
            let line = getArrayOfClassedElements('grid-element').filter(function(e) {
                return e.dataset.y == yCurrent;
            });

            if (column.length > 0) {
                addE('append', parseInt(line[0].style.width) || 0, parseInt(line[0].style.height) || 0, parseInt(line[0].style.top) || 0, parseInt(column[0].style.left) || 0);
            } else {
                if (line.length < xMax) {
                    maxX++;
                    var newX = calculateSize(parseInt(c.style.width) || 0, maxX - minX + 1);
                    getArrayOfClassedElements('grid-element').forEach(function(e) {
                        // $(e).animate({
                        //     left:(maxX - minX - xCurrent + parseInt($(e).attr("data-x")) + 1) * gap + (maxX - minX - xCurrent + parseInt($(e).attr("data-x"))) * (2 * parseInt($(".grid-element").first().css("border-width")) + newX),
                        //     width:newX
                        // }, "fast");
                    });
                    addE('append', newX, parseInt(line[0].style.height) || 0, parseInt(line[0].style.top) || 0, (maxX - minX + 1) * gap + (maxX - minX) * (2 * (parseInt(getArrayOfClassedElements('grid-element')[0].style.borderWidth) || 0) + newX));
                } else {
                    // line.first.animate({backgroundColor:activeColour}, "fast");
                    FX.backgroundColor(line[0], activeColour, {
                        duration: 2000
                    });
                    xCurrent = parseInt(line[0].dataset.x) || 0;
                }
            }
        }
    };

    function moveDown() {
        yCurrent++;
        // document.getElementById('grid-element-' + xCurrent + '-' + (yCurrent - 1)).animate({backgroundColor:colour}, "fast");
        FX.backgroundColor(document.getElementById('grid-element-' + xCurrent + '-' + (yCurrent - 1)), colour, {
            duration: 2000
        });

        if (document.getElementById('grid-element-' + xCurrent + '-' + yCurrent) != null) {
            // document.getElementById('grid-element-' + xCurrent + '-' + yCurrent).animate({backgroundColor:activeColour}, "fast");
            FX.backgroundColor(document.getElementById('grid-element-' + xCurrent + '-' + yCurrent), activeColour, {
                duration: 2000
            });
        } else {
            let column = getArrayOfClassedElements('grid-element').filter(function(e) {
                return e.dataset.x == xCurrent;
            });
            const line = getArrayOfClassedElements('grid-element').filter(function(e) {
                return e.dataset.y == yCurrent;
            });

            if (line.length > 0) {
                addE('append', parseInt(line[0].style.width) || 0, parseInt(line[0].style.height) || 0, parseInt(line[0].style.top) || 0, parseInt(column[0].style.left) || 0);
            } else {
                if (column.length < yMax) {
                    maxY++;
                    const newY = calculateSize(parseInt(c.style.height) || 0, maxY - minY + 1);
                    getArrayOfClassedElements('grid-element').forEach(function(e) {
                        // $(e).animate({
                        //     top:(maxY - minY - yCurrent + parseInt($(e).attr("data-y")) + 1) * gap + (maxY - minY - yCurrent + parseInt($(e).attr("data-y"))) * (2 * parseInt($(".grid-element").first().css("border-width")) + newY),
                        //     height:newY
                        // }, "fast");
                    });
                    addE('append', parseInt(column[0].style.width) || 0, newY, (maxY - minY + 1) * gap + (maxY - minY) * (2 * (parseInt(getArrayOfClassedElements('grid-element')[0].style.borderWidth) || 0) + newY), parseInt(column[0].style.left) || 0);
                } else {
                    // column.first.animate({backgrounColor:activeColour}, "fast");
                    FX.backgroundColor(column[0], activeColour, {
                        duration: 2000
                    });
                    yCurrent = parseInt(column[0].dataset.y) || 0;
                }
            }
        }
    };

    function doKeyUp(key) {
        switch(key) {
            case 27:
                close();
                break;
            case 37:
                moveLeft();
                break;
            case 38:
                moveUp();
                break;
            case 39:
                moveRight();
                break;
            case 40:
                moveDown();
                break;
        }
    };

    let timeout;
    window.addEventListener('keyup', function(e) {
        e.preventDefault();
        timeout = setTimeout(doKeyUp, timeout !== undefined ? 100 : 0, e.which);
    });

    window.addEventListener('resize', function() {
        xMax = calculateMax(parseInt(c.style.width) || 0);
        yMax = calculateMax(parseInt(c.style.height) || 0);
        var newX = calculateSize(c.width, maxX - minX + 1),
            newY = calculateSize(c.height, maxY - minY + 1);

        getArrayOfClassedElements(document.getElementsByClassName('grid-element')).forEach(function(e) {
            // $(e).animate({
            //     top:(parseInt($(e).attr("data-y")) - minY + 1) * gap + (parseInt($(e).attr("data-y")) - minY) * (2 * parseInt($(".grid-element").first().css("border-width")) + newY),
            //     left:(parseInt($(e).attr("data-X")) - minX + 1) * gap + (parseInt($(e).attr("data-x")) - minX) * (2 * parseInt($(".grid-element").first().css("border-width")) + newX),
            //     width:newX,
            //     height:newY
            // }, "fast");
        });
    });
};
