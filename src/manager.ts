namespace LCB {
  export class Manager {
    public element: HTMLCanvasElement;

    private ctx2d: Context2D;
    private boxStack: Box[] = [];
    private selectedBox: Box | null = null;
    private selectedBoxCornerName: CornerName | null;
    private selectedBoxResizing: boolean = false;
    private snapshots: ImageData[] = [];

    public add(box: Box): void {
      this.boxStack.push(box);
      if (this.ctx2d) {
        box.render(this.ctx2d);
      }
    }

    public renderTo(selector: string): void {
      const element = document.querySelector(selector);
      if (element) {
        this.setupCanvas(element as HTMLCanvasElement);
        this.drawAllBoxes();
      } else {
        throw new TypeError(
          `Cannot found any element for selector "${selector}"`
        );
      }
    }

    private drawAllBoxes() {
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

    private setupCanvas(element: HTMLCanvasElement): void {
      this.element = element;
      this.ctx2d = this.element.getContext("2d") as Context2D;

      this.element.addEventListener("mousedown", e => {
        const left = e.layerX;
        const top = e.layerY;

        // 如果当前已有选中的 box，并且当前点击落在该 box 上，则不需要在检查是否在其他 box 上
        // 以保证当前已选择的 box 不会被更高层级的相同区域的 box 抢占焦点
        if (
          this.selectedBox &&
          Utils.pointInsideRect(left, top, this.selectedBox.getRect())
        ) {
          // 重新检查是否落在四个顶点，以便重置缩放状态
          const cornerName = Utils.pointInsideCorner(
            left,
            top,
            this.selectedBox.getCorners()
          );
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
          const cornerName = Utils.pointInsideCorner(
            left,
            top,
            box.getCorners()
          );
          this.selectedBoxCornerName = cornerName || null;
          this.selectedBoxResizing = cornerName ? true : false;
          console.log("select box", box, cornerName);
        } else {
          if (this.selectedBox) {
            const cornerName = Utils.pointInsideCorner(
              left,
              top,
              this.selectedBox.getCorners()
            );
            if (cornerName) {
              this.selectedBoxCornerName = cornerName;
              this.selectedBoxResizing = true;
            } else {
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
            Utils.resizeRectByCornerName(
              rect,
              this.selectedBoxCornerName,
              e.movementX,
              e.movementY
            );
          } else {
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

    private findBoxAtPoint(left: number, top: number): Box | undefined {
      for (let i = this.boxStack.length - 1; i >= 0; i--) {
        const box = this.boxStack[i];
        if (Utils.pointInsideRect(left, top, box.getRect())) {
          return box;
        }
      }
      console.log("no box");
    }

    private capture(): void {
      this.snapshots.push(
        this.ctx2d.getImageData(0, 0, this.element.width, this.element.height)
      );
    }

    private restore(): void {
      const data = this.snapshots.pop();
      if (data) {
        this.ctx2d.putImageData(data, 0, 0);
      } else {
        this.drawAllBoxes();
      }
    }
  }
}
