"use strict";
var LCB;
(function (LCB) {
    function getInitialBoxProps() {
        const rect = { top: 10, left: 10, width: 100, height: 100 };
        return {
            rect,
            border: { width: 1, color: "rgb(0,0,255)", style: "line" },
            corners: getRectCorners(rect)
        };
    }
    LCB.getInitialBoxProps = getInitialBoxProps;
    function getRectCorners(rect) {
        const pw = 6;
        const pwh = pw / 2;
        return {
            leftTop: {
                left: rect.left - pwh,
                top: rect.top - pwh,
                width: pw,
                height: pw
            },
            rightTop: {
                left: rect.left + rect.width - pwh,
                top: rect.top - pwh,
                width: pw,
                height: pw
            },
            leftBottom: {
                left: rect.left - pwh,
                top: rect.top + rect.height - pwh,
                width: pw,
                height: pw
            },
            rightBottom: {
                left: rect.left + rect.width - pwh,
                top: rect.top + rect.height - pwh,
                width: pw,
                height: pw
            }
        };
    }
    LCB.getRectCorners = getRectCorners;
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
        getCorners() {
            return this.props.corners;
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
            this.props.corners = getRectCorners(this.props.rect);
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
            const corners = this.props.corners;
            const border = this.props.border;
            ctx.save();
            // ctx.globalAlpha = 0.05;
            // ctx.fillStyle = 'black';
            // ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
            // ctx.globalAlpha = 1;
            LCB.Utils.drawRectLine(ctx, rect.left, rect.top, rect.width, rect.height, "black", 0.5);
            ctx.fillStyle = "black";
            const fillRect = (r) => {
                ctx.fillRect(r.left, r.top, r.width, r.height);
            };
            fillRect(corners.leftTop);
            fillRect(corners.leftBottom);
            fillRect(corners.rightTop);
            fillRect(corners.rightBottom);
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
        getControlTypeByPoint(left, top) {
            const rect = this.props.rect;
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
    class Manager {
        constructor() {
            this.boxStack = [];
            this.selectedBox = null;
            this.selectedBoxResizing = false;
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
                const left = e.layerX;
                const top = e.layerY;
                // 如果当前已有选中的 box，并且当前点击落在该 box 上，则不需要在检查是否在其他 box 上
                // 以保证当前已选择的 box 不会被更高层级的相同区域的 box 抢占焦点
                if (this.selectedBox &&
                    LCB.Utils.pointInsideRect(left, top, this.selectedBox.getRect())) {
                    // 重新检查是否落在四个顶点，以便重置缩放状态
                    const cornerName = LCB.Utils.pointInsideCorner(left, top, this.selectedBox.getCorners());
                    this.selectedBoxCornerName = cornerName || null;
                    this.selectedBoxResizing = cornerName ? true : false;
                    return;
                }
                // 查找是否落在某个 box 范围内
                // 如果是，则将其设置为当前选中的 box，被设置为移动位置状态
                // 否则检查是否落在当前已选中 box 的四个顶点上，是则设置为缩放状态
                const box = this.findBoxAtPoint(left, top);
                if (box) {
                    this.capture();
                    this.boxStack.forEach(box => box.setNormal());
                    this.selectedBox = box;
                    box.setEditable(this.ctx2d);
                    const cornerName = LCB.Utils.pointInsideCorner(left, top, box.getCorners());
                    this.selectedBoxCornerName = cornerName || null;
                    this.selectedBoxResizing = cornerName ? true : false;
                    console.log("select box", box, cornerName);
                }
                else {
                    if (this.selectedBox) {
                        const cornerName = LCB.Utils.pointInsideCorner(left, top, this.selectedBox.getCorners());
                        if (cornerName) {
                            this.selectedBoxCornerName = cornerName;
                            this.selectedBoxResizing = true;
                        }
                        else {
                            this.selectedBox.setNormal();
                            this.selectedBox = null;
                            this.selectedBoxCornerName = null;
                            this.selectedBoxResizing = false;
                            this.drawAllBoxes();
                        }
                    }
                }
            });
            this.element.addEventListener("mousemove", e => {
                // 仅当鼠标移动且左键被按下，当前有选中的 box 时才需要做检查
                if (e.buttons === 1 && this.selectedBox) {
                    this.restore();
                    this.boxStack.forEach(box => box.setNormal());
                    const box = this.selectedBox;
                    const rect = box.getRect();
                    if (this.selectedBoxResizing && this.selectedBoxCornerName) {
                        // 缩放状态，需要判断是哪个短点以便进行相应的运算
                        LCB.Utils.resizeRectByCornerName(rect, this.selectedBoxCornerName, e.movementX, e.movementY);
                    }
                    else {
                        // 移动位置
                        rect.left += e.movementX;
                        rect.top += e.movementY;
                    }
                    box.setRect(rect);
                    box.setEditable(this.ctx2d);
                }
            });
            this.element.addEventListener("mouseup", e => {
                if (this.selectedBox) {
                    this.drawAllBoxes();
                }
            });
        }
        findBoxAtPoint(left, top) {
            for (let i = this.boxStack.length - 1; i >= 0; i--) {
                const box = this.boxStack[i];
                if (LCB.Utils.pointInsideRect(left, top, box.getRect())) {
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
        function drawVerticalLine(ctx, left, top, width, color, lineWidth = 1) {
            ctx.fillStyle = color;
            ctx.fillRect(left, top, lineWidth, width);
        }
        Utils.drawVerticalLine = drawVerticalLine;
        function drawHorizontalLine(ctx, left, top, width, color, lineWidth = 1) {
            ctx.fillStyle = color;
            ctx.fillRect(left, top, width, lineWidth);
        }
        Utils.drawHorizontalLine = drawHorizontalLine;
        function drawRectLine(ctx, left, top, width, height, color, lineWidth = 1) {
            drawHorizontalLine(ctx, left, top, width, color, lineWidth);
            drawHorizontalLine(ctx, left, top + height, width, color, lineWidth);
            drawVerticalLine(ctx, left, top, height, color, lineWidth);
            drawVerticalLine(ctx, left + width, top, height, color, lineWidth);
        }
        Utils.drawRectLine = drawRectLine;
        function getRectCenter(rect) {
            const hw = rect.width / 2;
            const hh = rect.height / 2;
            return { left: rect.left + hw, top: rect.top + hh };
        }
        Utils.getRectCenter = getRectCenter;
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
        Utils.pointInsideRect = pointInsideRect;
        function pointInsideCorner(left, top, corners) {
            if (pointInsideRect(left, top, corners.leftTop))
                return "leftTop";
            if (pointInsideRect(left, top, corners.leftBottom))
                return "leftBottom";
            if (pointInsideRect(left, top, corners.rightTop))
                return "rightTop";
            if (pointInsideRect(left, top, corners.rightBottom))
                return "rightBottom";
        }
        Utils.pointInsideCorner = pointInsideCorner;
        function resizeRectByCornerName(rect, cornerName, movementX, movementY) {
            switch (cornerName) {
                case "leftTop":
                    rect.left += movementX;
                    rect.top += movementY;
                    rect.width -= movementX;
                    rect.height -= movementY;
                    break;
                case "leftBottom":
                    rect.left += movementX;
                    rect.width -= movementX;
                    rect.height += movementY;
                    break;
                case "rightTop":
                    rect.top += movementY;
                    rect.width += movementX;
                    rect.height -= movementY;
                    break;
                case "rightBottom":
                    rect.width += movementX;
                    rect.height += movementY;
                    break;
            }
        }
        Utils.resizeRectByCornerName = resizeRectByCornerName;
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
