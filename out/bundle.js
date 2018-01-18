"use strict";
var LCB;
(function (LCB) {
    function getInitialBoxProps() {
        return {
            rect: { top: 10, left: 10, width: 100, height: 100 },
            border: { width: 1, color: "rgb(0,0,255)", style: "line" }
        };
    }
    LCB.getInitialBoxProps = getInitialBoxProps;
    function emptyBoxRenderFunction() { }
    LCB.emptyBoxRenderFunction = emptyBoxRenderFunction;
    function getLineDash(style) {
        switch (style) {
            case "dash":
                return [4, 2];
            default:
                return [];
        }
    }
    LCB.getLineDash = getLineDash;
    class Box {
        constructor() {
            this.isReady = false;
            this.props = getInitialBoxProps();
            this.renderFn = emptyBoxRenderFunction;
            this.isEditing = false;
        }
        getRect() {
            return this.props.rect;
        }
        setRect(rect) {
            if ("left" in rect)
                this.props.rect.left = rect.left;
            if ("top" in rect)
                this.props.rect.top = rect.top;
            if ("width" in rect)
                this.props.rect.width = rect.width;
            if ("height" in rect)
                this.props.rect.height = rect.height;
        }
        setBorder(border) {
            if ("width" in border)
                this.props.border.width = border.width;
            if ("color" in border)
                this.props.border.color = border.color;
            if ("style" in border)
                this.props.border.style = border.style;
        }
        setFunction(fn) {
            this.renderFn = fn;
        }
        drawEditableBorder(ctx) {
            const rect = this.props.rect;
            const border = this.props.border;
            ctx.save();
            // ctx.globalAlpha = 0.05;
            // ctx.fillStyle = 'black';
            // ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
            // ctx.globalAlpha = 1;
            LCB.Utils.drawRectLine(ctx, rect.left, rect.top, rect.width, rect.height, "blue");
            const pw = 6;
            const pwh = pw / 2;
            ctx.fillStyle = "blue";
            ctx.fillRect(rect.left - pwh, rect.top - pwh, pw, pw);
            ctx.fillRect(rect.left + rect.width - pwh, rect.top - pwh, pw, pw);
            ctx.fillRect(rect.left - pwh, rect.top + rect.height - pwh, pw, pw);
            ctx.fillRect(rect.left + rect.width - pwh, rect.top + rect.height - pwh, pw, pw);
            ctx.restore();
        }
        setEditable(ctx) {
            this.isEditing = true;
            this.drawEditableBorder(ctx);
        }
        setNormal() {
            this.isEditing = false;
        }
        render(ctx) {
            const rect = this.props.rect;
            const border = this.props.border;
            ctx.save();
            this.renderFn(ctx, rect, this);
            ctx.restore();
            if (this.isEditing) {
                this.drawEditableBorder(ctx);
            }
        }
    }
    LCB.Box = Box;
})(LCB || (LCB = {}));
window.addEventListener("load", function () {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
        const m = new LCB.Manager();
        const b1 = new LCB.Box();
        b1.isReady = true;
        b1.setRect({ top: 100, left: 100 });
        b1.setFunction(function (ctx, rect, box) {
            ctx.font = "18px serif";
            ctx.fillText("hello, world", rect.left + rect.width / 2 - 20, rect.top + rect.height / 2);
        });
        m.add(b1);
        const b2 = new LCB.Box();
        b2.isReady = true;
        b2.setRect({ top: 200, left: 300 });
        b2.setFunction(function (ctx, rect, box) {
            ctx.beginPath();
            ctx.arc(rect.left + rect.width / 2, rect.top + rect.height / 2, 50, 0, 2 * Math.PI);
            ctx.fillStyle = "yellow";
            ctx.fill();
            ctx.font = "18px serif";
            ctx.fillStyle = "red";
            ctx.fillText("hello, world", rect.left + rect.width / 2 - 20, rect.top + rect.height / 2);
        });
        m.add(b2);
        const b3 = new LCB.ImageBox();
        b3.setRect({ top: 50, left: 200, width: 200, height: 100 });
        b3.setImage("assets/bd_logo1.png");
        m.add(b3);
        const b4 = new LCB.TextBox();
        b4.setRect({ top: 100, left: 200, width: 200, height: 100 });
        b4.setText("This is test");
        b4.setFont("24px serif");
        b4.setColor("green");
        m.add(b4);
        m.renderTo("canvas");
    }
});
var LCB;
(function (LCB) {
    function pointInsideRect(left, top, rect) {
        if (left < rect.left)
            return false;
        if (left > rect.left + rect.width)
            return false;
        if (top < rect.top)
            return false;
        if (top > rect.top + rect.height)
            return false;
        return true;
    }
    LCB.pointInsideRect = pointInsideRect;
    class Manager {
        constructor() {
            this.boxStack = [];
            this.selectedBox = null;
            this.snapshots = [];
        }
        add(box) {
            this.boxStack.push(box);
            if (this.ctx2d) {
                box.render(this.ctx2d);
            }
        }
        renderTo(selector) {
            const element = document.querySelector(selector);
            if (element) {
                this.setupCanvas(element);
                this.drawAllBoxes();
            }
            else {
                throw new TypeError(`Cannot found any element for selector "${selector}"`);
            }
        }
        drawAllBoxes() {
            this.ctx2d.clearRect(0, 0, this.element.width, this.element.height);
            let isReady = true;
            this.boxStack.forEach(box => {
                box.render(this.ctx2d);
                isReady = isReady && box.isReady;
            });
            this.snapshots = [];
            if (!isReady) {
                requestAnimationFrame(() => this.drawAllBoxes());
            }
        }
        setupCanvas(element) {
            this.element = element;
            this.ctx2d = this.element.getContext("2d");
            this.element.addEventListener("mousedown", e => {
                // console.log('mousedown', e);
                const box = this.findBoxAtPoint(e.layerX, e.layerY);
                if (box) {
                    this.capture();
                    this.boxStack.forEach(box => box.setNormal());
                    this.selectedBox = box;
                    box.setEditable(this.ctx2d);
                    console.log("select box", box);
                }
                else {
                    if (this.selectedBox) {
                        this.selectedBox.setNormal();
                        this.selectedBox = null;
                        this.drawAllBoxes();
                    }
                }
            });
            this.element.addEventListener("mousemove", e => {
                // console.log("mousemove", e, e.buttons);
                if (e.buttons === 1 && this.selectedBox) {
                    this.restore();
                    this.boxStack.forEach(box => box.setNormal());
                    const box = this.selectedBox;
                    const rect = box.getRect();
                    rect.left += e.movementX;
                    rect.top += e.movementY;
                    box.setRect(rect);
                    box.setEditable(this.ctx2d);
                }
            });
            this.element.addEventListener("mouseup", e => {
                // console.log('mouseup', e);
                if (this.selectedBox) {
                    this.drawAllBoxes();
                }
            });
        }
        findBoxAtPoint(left, top) {
            for (let i = this.boxStack.length - 1; i >= 0; i--) {
                const box = this.boxStack[i];
                if (pointInsideRect(left, top, box.getRect())) {
                    return box;
                }
            }
            console.log("no box");
        }
        capture() {
            this.snapshots.push(this.ctx2d.getImageData(0, 0, this.element.width, this.element.height));
        }
        restore() {
            const data = this.snapshots.pop();
            if (data) {
                this.ctx2d.putImageData(data, 0, 0);
            }
            else {
                this.drawAllBoxes();
            }
        }
    }
    LCB.Manager = Manager;
})(LCB || (LCB = {}));
var LCB;
(function (LCB) {
    let Utils;
    (function (Utils) {
        function drawVerticalLine(ctx, left, top, width, color) {
            ctx.fillStyle = color;
            ctx.fillRect(left, top, 1, width);
        }
        Utils.drawVerticalLine = drawVerticalLine;
        function drawHorizontalLine(ctx, left, top, width, color) {
            ctx.fillStyle = color;
            ctx.fillRect(left, top, width, 1);
        }
        Utils.drawHorizontalLine = drawHorizontalLine;
        function drawRectLine(ctx, left, top, width, height, color) {
            drawHorizontalLine(ctx, left, top, width, color);
            drawHorizontalLine(ctx, left, top + height, width, color);
            drawVerticalLine(ctx, left, top, height, color);
            drawVerticalLine(ctx, left + width, top, height, color);
        }
        Utils.drawRectLine = drawRectLine;
        function getRectCenter(rect) {
            const hw = rect.width / 2;
            const hh = rect.height / 2;
            return { left: rect.left + hw, top: rect.top + hh };
        }
        Utils.getRectCenter = getRectCenter;
    })(Utils = LCB.Utils || (LCB.Utils = {}));
})(LCB || (LCB = {}));
var LCB;
(function (LCB) {
    class ImageBox extends LCB.Box {
        constructor() {
            super();
            this.setFunction((ctx, rect, box) => {
                const img = this.image;
                ctx.drawImage(img, 0, 0, img.width, img.height, rect.left, rect.top, rect.width, rect.height);
            });
        }
        setImage(src) {
            this.imageSrc = src;
            this.image = document.createElement("img");
            this.image.src = src;
            this.image.onload = () => {
                this.isReady = true;
            };
        }
    }
    LCB.ImageBox = ImageBox;
})(LCB || (LCB = {}));
var LCB;
(function (LCB) {
    class TextBox extends LCB.Box {
        constructor() {
            super();
            this.setFunction((ctx, rect, box) => {
                const center = LCB.Utils.getRectCenter(rect);
                ctx.font = this.font;
                ctx.textAlign = "center";
                ctx.fillStyle = this.color;
                ctx.fillText(this.text, center.left, center.top, rect.width);
            });
        }
        setText(text) {
            this.text = text;
            this.isReady = true;
        }
        setFont(font) {
            this.font = font;
        }
        setColor(color) {
            this.color = color;
        }
    }
    LCB.TextBox = TextBox;
})(LCB || (LCB = {}));
