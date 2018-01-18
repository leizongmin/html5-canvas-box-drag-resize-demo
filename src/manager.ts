namespace LCB {
  export function pointInsideRect(
    left: number,
    top: number,
    rect: Rect
  ): boolean {
    if (left < rect.left) return false;
    if (left > rect.left + rect.width) return false;
    if (top < rect.top) return false;
    if (top > rect.top + rect.height) return false;
    return true;
  }

  export class Manager {
    public element: HTMLCanvasElement;

    private ctx2d: Context2D;
    private boxStack: Box[] = [];
    private selectedBox: Box | null = null;
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
        // console.log('mousedown', e);
        const box = this.findBoxAtPoint(e.layerX, e.layerY);
        if (box) {
          this.capture();
          this.boxStack.forEach(box => box.setNormal());
          this.selectedBox = box;
          box.setEditable(this.ctx2d);
          console.log("select box", box);
        } else {
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

    private findBoxAtPoint(left: number, top: number): Box | undefined {
      for (let i = this.boxStack.length - 1; i >= 0; i--) {
        const box = this.boxStack[i];
        if (pointInsideRect(left, top, box.getRect())) {
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
        this.ctx2d.putImageData(
          data,
          0,
          0
        );
      } else {
        this.drawAllBoxes();
      }
    }
  }
}
