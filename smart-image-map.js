(function()
{
    'use strict';

    function resizeMap(map)
    {
        if (typeof map._resize === 'function') return;

        var areas = map.getElementsByTagName("area");
        var originalCoords = Array.from(areas).map(a => a.coords.replace(/ *, */g, ",").replace(/ +/g, ","));
        var image = document.querySelector('img[usemap="#' + map.name + '"]') || document.querySelector('img[usemap="' + map.name + '"]');

        function resize()
        {
            var styles = window.getComputedStyle(image);
            var scale = {
                width: image.width / image.naturalWidth,
                height: image.height / image.naturalHeight
            };
            var padding = {
                width: parseInt(styles.getPropertyValue("padding-left")) || 0,
                height: parseInt(styles.getPropertyValue("padding-top")) || 0
            };

            originalCoords.forEach((coords, i) => {
                var newCoords = coords.split(",").map((val, j) => {
                    var type = j % 2 === 0 ? "width" : "height";
                    return Math.floor(Number(val) * scale[type]) + padding[type];
                });
                areas[i].coords = newCoords.join(",");
            });
        }

        map._resize = resize;
        image.addEventListener("load", resize);
        window.addEventListener("focus", resize);
        window.addEventListener("resize", debounce(resize, 250));
        window.addEventListener("readystatechange", resize);
        document.addEventListener("fullscreenchange", resize);

        if (image.width !== image.naturalWidth || image.height !== image.naturalHeight)
        {
            resize();
        }
    }

    function debounce(fn, delay)
    {
        var timer;
        return function()
        {
            clearTimeout(timer);
            timer = setTimeout(fn, delay);
        };
    }

    function imageMapResize(selector = "map")
    {
        var maps = [];
        var nodes = typeof selector === "string" ? document.querySelectorAll(selector) : [selector];
        nodes.forEach(map => {
            if (map && map.tagName.toUpperCase() === "MAP")
            {
                resizeMap(map);
                maps.push(map);
            }
            else
            {
                throw new TypeError("Expected <map> element.");
            }
        });
        return maps;
    }

    window.imageMapResize = imageMapResize;

    if ("jQuery" in window)
    {
        jQuery.fn.imageMapResize = function()
        {
            this.filter("map").each(function() { resizeMap(this); });
            return this;
        };
    }

})();
