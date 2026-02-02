declare module 'cc' {
  export const _decorator: {
    ccclass: (name: string) => ClassDecorator;
    property: (...args: any[]) => PropertyDecorator;
  };

  export class Vec3 {
    constructor(x?: number, y?: number, z?: number);
    x: number;
    y: number;
    z: number;
    clone(): Vec3;
    add(v: Vec3): Vec3;
    subtract(v: Vec3): Vec3;
    multiplyScalar(n: number): Vec3;
    normalize(): Vec3;
    dot(v: Vec3): number;
    length(): number;
  }

  export class Color {
    constructor(r?: number, g?: number, b?: number, a?: number);
    r: number;
    g: number;
    b: number;
    a: number;
  }

  export class Component {
    node: Node;
    getComponent<T extends Component>(type: new () => T): T | null;
    addComponent<T extends Component>(type: new () => T): T;
  }

  export class Node {
    constructor(name?: string);
    name: string;
    active: boolean;
    parent: Node | null;
    position: Vec3;
    worldPosition: Vec3;
    angle: number;
    scale: Vec3;
    addChild(node: Node): void;
    getChildByName(name: string): Node | null;
    setPosition(pos: Vec3): void;
    setScale(scale: Vec3): void;
    setScale(x: number, y?: number, z?: number): void;
    on(type: string, callback: (event: EventTouch) => void, target?: unknown): void;
    getComponent<T extends Component>(type: new () => T): T | null;
    addComponent<T extends Component>(type: new () => T): T;
    destroy(): void;
    setSiblingIndex(index: number): void;
  }

  export namespace Node {
    export const EventType: {
      TOUCH_END: string;
    };
  }

  export class Graphics extends Component {
    fillColor: Color;
    strokeColor: Color;
    lineWidth: number;
    clear(): void;
    circle(x: number, y: number, r: number): void;
    rect(x: number, y: number, width: number, height: number): void;
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    arc(cx: number, cy: number, r: number, a0: number, a1: number, counterclockwise?: boolean): void;
    close(): void;
    fill(): void;
    stroke(): void;
  }

  export class Label extends Component {
    static Overflow: { SHRINK: number; RESIZE_HEIGHT: number };
    static HorizontalAlign: { LEFT: number; CENTER: number };
    static VerticalAlign: { TOP: number; MIDDLE: number };
    color: Color;
    fontSize: number;
    lineHeight: number;
    overflow: number;
    horizontalAlign: number;
    verticalAlign: number;
    string: string;
  }

  export class UITransform extends Component {
    contentSize: { width: number; height: number };
    setContentSize(width: number, height: number): void;
    setAnchorPoint(x: number, y: number): void;
    convertToNodeSpaceAR(pos: Vec3): Vec3;
  }

  export class Widget extends Component {
    isAlignTop: boolean;
    top: number;
    isAlignLeft: boolean;
    left: number;
    isAlignBottom: boolean;
    bottom: number;
    isAlignRight: boolean;
    right: number;
    isAlignHorizontalCenter: boolean;
    isAlignVerticalCenter: boolean;
    horizontalCenter: number;
    verticalCenter: number;
    align(): void;
    updateAlignment(): void;
  }

  export class Button extends Component {
    static Transition: { NONE: number; SCALE: number };
    transition: number;
    zoomScale: number;
    duration: number;
    clickEvents: EventHandler[];
  }

  export class EventHandler {
    target: Node | null;
    component: string;
    handler: string;
  }

  export class EventTouch {
    getUILocation(): { x: number; y: number };
  }

  export class JsonAsset {
    json: unknown;
  }

  export const assetManager: {
    loadBundle: (name: string, cb: (err: unknown, bundle: assetManager.Bundle | null) => void) => void;
  };

  export namespace assetManager {
    export class Bundle {
      load: (path: string, type: new () => JsonAsset, cb: (err: unknown, asset: JsonAsset | null) => void) => void;
    }
  }

  export const director: {
    getScene: () => Node | null;
  };

  export function tween<T extends object>(target: T): any;
}
