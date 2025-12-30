/**
 * 1. INITIALIZATION & LOCOMOTIVE SCROLL
 */
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

const scroll = new LocomotiveScroll({
    el: document.querySelector("#main"),
    smooth: true,
    lerp: 0.1,
    smartphone: { smooth: true },
    tablet: { smooth: true }
});

// Setup ScrollTrigger to work with Locomotive Scroll
ScrollTrigger.scrollerProxy("#main", {
    scrollTop(value) {
        return arguments.length ? scroll.scrollTo(value, 0, 0) : scroll.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    }
});

ScrollTrigger.addEventListener("refresh", () => scroll.update());
ScrollTrigger.refresh();

/**
 * 2. MOUSE FOLLOWER (DESKTOP ONLY)
 */
let timeout;
function circleskewithmouse() {
    var xscale = 1;
    var yscale = 1;
    var xprev = 0;
    var yprev = 0;

    window.addEventListener("mousemove", function (dets) {
        clearTimeout(timeout);

        // Calculate velocity for the "skew" (stretching) effect
        var xdiff = dets.clientX - xprev;
        var ydiff = dets.clientY - yprev;

        xscale = gsap.utils.clamp(0.8, 1.2, 1 + (Math.abs(xdiff) * 0.01));
        yscale = gsap.utils.clamp(0.8, 1.2, 1 + (Math.abs(ydiff) * 0.01));

        xprev = dets.clientX;
        yprev = dets.clientY;

        // Apply movement and scale
        document.querySelector("#minicircle").style.transform = 
            `translate(${dets.clientX}px, ${dets.clientY}px) scale(${xscale}, ${yscale})`;

        // Reset to perfect circle when mouse stops
        timeout = setTimeout(function () {
            document.querySelector("#minicircle").style.transform = 
                `translate(${dets.clientX}px, ${dets.clientY}px) scale(1, 1)`;
        }, 100);
    });
}

/**
 * 3. RECURRING REVEAL ANIMATIONS (HERO & SKILLSET)
 */
function firstpageanim() {
    var tl = gsap.timeline({
        scrollTrigger: {
            trigger: "#hero",
            scroller: "#main",
            start: "top 10%",
            end: "bottom 20%",
            // restart: plays on enter, reverse: plays back on leave to allow re-entry
            toggleActions: "restart reverse restart reverse"
        }
    });

    tl.from("#nav", {
        y: -10,
        opacity: 0,
        duration: 1.2,
        ease: "expo.inOut"
    });

    tl.to(".boundingelem", {
        y: 0,
        ease: "expo.inOut",
        duration: 1.2,
        stagger: 0.2,
        delay: -0.8
    });

    tl.from("#herofooter", {
        y: -10,
        opacity: 0,
        duration: 1.2,
        delay: -0.8,
        ease: "expo.inOut"
    });
}

function skillSetAnim() {
    gsap.to("#skillset h1", {
        y: 0,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: {
            trigger: "#skillset",
            scroller: "#main",
            start: "top 85%",
            end: "bottom 15%",
            toggleActions: "restart reverse restart reverse" 
        }
    });
}

/**
 * 4. ELEMENT HOVER: IMAGE FOLLOW & TEXT SPLIT (DESKTOP ONLY)
 */
if (!isTouchDevice) {
    document.querySelectorAll(".elem").forEach(function (elem) {
        let mouseStopTimer;
        let rotate = 0;
        const img = elem.querySelector("img");
        const h1 = elem.querySelector("h1");
        const h3 = elem.querySelector("h3");

        elem.addEventListener("mousemove", function (details) {
            let diffrot = details.clientX - rotate;
            rotate = details.clientX;

            clearTimeout(mouseStopTimer);
            gsap.killTweensOf([img, h1, h3]);

            var elemRect = elem.getBoundingClientRect();

            gsap.to(img, {
                display: "block",
                opacity: 1,
                top: details.clientY - elemRect.top,
                left: details.clientX - elemRect.left,
                xPercent: -50,
                yPercent: -50,
                rotate: gsap.utils.clamp(-20, 20, diffrot * 0.8),
                duration: 0.5,
                ease: "power3"
            });

            gsap.to(h1, { opacity: 0.2, x: 50, duration: 0.5 });
            gsap.to(h3, { opacity: 0.2, x: -50, duration: 0.5 });

            mouseStopTimer = setTimeout(function () {
                gsap.to(img, {
                    opacity: 0,
                    duration: 0.3,
                    onComplete: () => { img.style.display = "none"; }
                });
                gsap.to([h1, h3], {
                    opacity: (i) => i === 0 ? 0.6 : 1,
                    x: 0,
                    duration: 0.5,
                    ease: "power3"
                });
            }, 250);
        });

        elem.addEventListener("mouseleave", function () {
            clearTimeout(mouseStopTimer);
            gsap.killTweensOf([img, h1, h3]);
            gsap.to(img, { opacity: 0, duration: 0.2, onComplete: () => { img.style.display = "none"; } });
            gsap.to(h1, { opacity: 0.6, x: 0, duration: 0.5 });
            gsap.to(h3, { opacity: 1, x: 0, duration: 0.5 });
        });
    });
}

/**
 * 5. PROFILE 3D TILT & GLOW (BAAREME)
 */
function profileImageInteractions() {
    const image = document.querySelector("#baareme img");
    if (!image || isTouchDevice) return;

    image.addEventListener("mousemove", (dets) => {
        const bound = image.getBoundingClientRect();
        const mouseX = dets.clientX - bound.left - bound.width / 2;
        const mouseY = dets.clientY - bound.top - bound.height / 2;
        
        const rotateX = gsap.utils.mapRange(-bound.height / 2, bound.height / 2, 15, -15, mouseY);
        const rotateY = gsap.utils.mapRange(-bound.width / 2, bound.width / 2, -15, 15, mouseX);

        gsap.to(image, {
            rotationX: rotateX,
            rotationY: rotateY,
            scale: 1.07,
            boxShadow: `${mouseX * 0.05}px ${mouseY * 0.05}px 40px rgba(255, 255, 255, 0.3)`,
            duration: 0.6,
            ease: "power2.out",
            transformPerspective: 1000
        });
    });

    image.addEventListener("mouseleave", () => {
        gsap.to(image, {
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            boxShadow: "0px 0px 0px rgba(255, 255, 255, 0)",
            duration: 1.2,
            ease: "elastic.out(1, 0.3)"
        });
    });
}

/**
 * 6. UI MICRO-INTERACTIONS
 */
function linkAnimation() {
    document.querySelectorAll(".link").forEach(link => {
        link.addEventListener("mouseenter", () => gsap.to(link, { "--underline-scale": 1, duration: 0.4 }));
        link.addEventListener("mouseleave", () => gsap.to(link, { "--underline-scale": 0, duration: 0.4 }));
    });
}

function connectButtonMagnetic() {
    const btn = document.querySelector("#connect");
    if (!btn || isTouchDevice) return;

    btn.addEventListener("mousemove", (dets) => {
        const bound = btn.getBoundingClientRect();
        gsap.to(btn, {
            x: (dets.clientX - bound.left - bound.width / 2) * 0.3,
            y: (dets.clientY - bound.top - bound.height / 2) * 0.3,
            duration: 0.3
        });
    });

    btn.addEventListener("mouseleave", () => gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out" }));
}

function arrowHoverAnimation() {
    const iconset = document.querySelector("#iconset");
    if(!iconset) return;
    
    const arrows = document.querySelectorAll("#iconset .circle i");
    let arrowTl = gsap.timeline({ repeat: -1, paused: true });

    arrowTl.to(arrows, { y: 8, duration: 0.5, stagger: 0.2, yoyo: true, repeat: 1, ease: "power1.inOut" });

    iconset.addEventListener("mouseenter", () => arrowTl.play());
    iconset.addEventListener("mouseleave", () => {
        arrowTl.pause();
        gsap.to(arrows, { y: 0, duration: 0.3 });
    });
}

/**
 * INITIALIZE EVERYTHING
 */
if (!isTouchDevice) {
    circleskewithmouse();
}

linkAnimation();
connectButtonMagnetic();
profileImageInteractions();
arrowHoverAnimation();
firstpageanim();
skillSetAnim();