enum Alignment {
    Left,
    Top = Left,
    Center,
    Right,
    Bottom = Right
}

enum ButtonId {
    A,
    B,
    Up,
    Right,
    Down,
    Left
}

namespace menu {
    export let consolePriority = ConsolePriority.Debug;
    function log(msg: string) {
        console.add(consolePriority, `menu> ${msg}`);
    }

    export interface Updater {
        update(dt: number): void;
    }

    export class State {
        root: Node;
        focus: Component;
        focusStack: Component[];
        updatingNodes: Updater[];

        constructor(root: Node) {
            this.root = root;
            this.focus = undefined;
            this.focusStack = [];
            this.updatingNodes = [];

            let lastTime = control.millis();
            game.onUpdate(() => {
                let time = control.millis();
                const delta = time - lastTime;
                this.updatingNodes.forEach(n => n.update(delta));
                lastTime = time;
            })

            game.onPaint(() => {
                this.root.draw(screen, new BoundingBox(0, 0, screen.width, screen.height));
            });

            controller.A.onEvent(ControllerButtonEvent.Pressed, inputHandler(ButtonId.A))
            controller.B.onEvent(ControllerButtonEvent.Pressed, inputHandler(ButtonId.B))
            controller.up.onEvent(ControllerButtonEvent.Pressed, inputHandler(ButtonId.Up))
            controller.right.onEvent(ControllerButtonEvent.Pressed, inputHandler(ButtonId.Right))
            controller.down.onEvent(ControllerButtonEvent.Pressed, inputHandler(ButtonId.Down))
            controller.left.onEvent(ControllerButtonEvent.Pressed, inputHandler(ButtonId.Left))
        }
    }

    function inputHandler(button: ButtonId): () => void {
        return () => {
            const state = game.currentScene();
            if (state && state.menuState && state.menuState.focus) {
                let node: Node = state.menuState.focus;
                // bubble up
                while (node) {
                    if (node instanceof Component)
                        (<Component>node).handleInput(button);
                    node = node.parent;
                }
            }
        }
    }

    /**
     * Sets the root node of the UI
     *
     * @param node The Node to make the UI root
     */
    export function setRoot(node: Node) {
        log('set root');
        game.pushScene();
        game.currentScene().menuState = new menu.State(node);
    }

    /**
     * Pushes a component on top of the focus stack. The currently focused
     * component receives all button events until it is unfocused.
     */
    export function focus(c: Component, clearStack = false) {
        log(`focus`)
        const state = game.currentScene().menuState;
        if (!state) return;
        if (state.focus) {
            state.focus.onBlur();
            state.focus = undefined;
        }
        if (c) {
            log(`focusing`)
            state.focus = c;
            state.focusStack.push(c);
            c.onFocus();
        }

        if (clearStack)
            state.focusStack = state.focus ? [state.focus] : [];
    }

    /**
     * Removes the currently focused component from the focus stack
     * and returns focus to the next component.
     */
    export function popFocus() {
        const state = game.currentScene().menuState;
        if (!state) return;
        if (state.focus) {
            state.focus.onBlur();
            state.focus = undefined;
            state.focusStack.pop();
        }

        if (state.focusStack.length) {
            focus(state.focusStack.pop());
        }
    }

    /**
     * An animation that periodically calls a callback with a linear
     * timing function
     */
    export class Animation implements Updater {
        target: Node;
        cb: (node: Node, value: number) => void;
        running: boolean;
        startValue: number;
        endValue: number;
        elapsed: number;
        period: number;
        next: Animation;
        endedHandler: () => void;

        /**
         * Creates a linear timed Animation
         *
         * @param target The node to animate
         * @param cb The animation function
         */
        constructor(target: Node, cb: (node: Node, value: number) => void) {
            this.target = target;
            this.elapsed = 0;
            this.cb = cb;
        }

        /**
         * Sets the start value for the linear timing function
         *
         * @param start The start value to animate from
         * @return the Animation
         */
        from(start: number) {
            this.startValue = start;
            return this;
        }

        /**
         * Sets the end value for the linear timing function
         *
         * @param end The end value to end the animation at
         * @return the Animation
         */
        to(end: number) {
            this.endValue = end;
            return this;
        }

        /**
         * Sets the duration for the linear timing function
         *
         * @param period The duration of the animation in milliseconds
         * @return the Animation
         */
        duration(period: number) {
            this.period = period;
            return this;
        }

        /**
         * Sets an animation to run after this animation completes. Only
         * one animation can be registered to run after
         *
         * @param next The next animation to run
         * @return the Animation
         */
        chain(next: Animation) {
            this.next = next;
            return this;
        }

        /**
         * Registers a handler to run when the animation is completed (stoppied)
         * @param handler 
         */
        onEnded(handler: () => void) {
            this.endedHandler = handler;
            return this;
        }

        /**
         * Starts the animation for a single run
         */
        start() {
            if (this.running) return;
            this.running = true;
            subscribe(this);
        }

        /**
         * Starts the animation in a loop
         */
        loop() {
            this.chain(this);
            this.start();
        }

        /**
         * Stops the execution of the animation
         */
        stop() {
            this.running = false;
            this.elapsed = 0;
            unsubscribe(this);
            if (this.endedHandler)
                this.endedHandler();
        }

        update(dt: number) {
            if (!this.running) return;
            this.elapsed += dt;

            if (this.cb) {
                let value = this.startValue + (((this.endValue - this.startValue) / this.period) * this.elapsed) | 0;

                if (this.startValue > this.endValue) {
                    value = Math.max(this.endValue, value);
                }
                else {
                    value = Math.min(this.endValue, value);
                }

                this.cb(this.target, value);
                this.target.notifyChange();
            }

            if (this.elapsed > this.period) {
                this.stop();
                if (this.next) {
                    this.next.start();
                }
            }
        }
    }

    function disposeComponent(c: Component) {
        const state = game.currentScene().menuState;
        if (!state) return;

        if (state.focus === c) {
            state.focus = undefined;
            state.focusStack.pop();
            popFocus();
        }
        state.focusStack.removeElement(c);
    }

    function subscribe(node: Updater) {
        const state = game.currentScene().menuState;
        if (!state) return;

        state.updatingNodes.push(node);
    }

    function unsubscribe(node: Updater) {
        const state = game.currentScene().menuState;
        if (!state) return;

        state.updatingNodes.removeElement(node);
    }

    /**
     * A rectangle that represents the bounds of an element
     */
    export class BoundingBox {
        originX: number;
        originY: number;
        width: number;
        height: number;

        /**
         * Creates a BoundingBox
         *
         * @param ox The left edge of the bounds
         * @param oy The top edge of the bounds
         * @param width The width of the bounds
         * @param height The height of the bounds
         */
        constructor(ox: number, oy: number, width: number, height: number) {
            this.originX = ox;
            this.originY = oy;
            this.width = width;
            this.height = height;
        }
    }

    /**
     * A Node in the UI tree with dimensions
     */
    export class Node {
        protected _top: number;
        protected _left: number;
        protected _bounds: BoundingBox;
        protected dirty: boolean;

        fixedWidth: number;
        fixedHeight: number;

        parent: Node;
        children: Node[];

        constructor() {
            this.dirty = true;
            this._top = 0;
            this._left = 0;
        }

        /**
         * The current width of the Node
         */
        get width() {
            return this.fixedWidth || (this._bounds && this._bounds.width)
        }

        /**
         * The current height of the Node
         */
        get height() {
            return this.fixedHeight || (this._bounds && this._bounds.height)
        }

        get top() {
            return this._top;
        }

        set top(t: number) {
            if (t === this.top) return;
            this._top = t;
            this.notifyChange();
        }

        get left() {
            return this._left
        }

        set left(l: number) {
            if (l === this.left) return;
            this._left = l;
            this.notifyChange();
        }

        get bottom() {
            return this._top + this.fixedHeight;
        }

        set bottom(b: number) {
            if (b === this.bottom) return;
            this._top = b - this.fixedHeight;
            this.notifyChange();
        }

        get right() {
            return this._left + this.fixedWidth;
        }

        set right(r: number) {
            if (r === this.right) return;
            this._left = r - this.fixedWidth;
            this.notifyChange();
        }

        draw(canvas: Image, available: BoundingBox) {
            this._bounds = this.getBounds(available);

            this.drawSelf(canvas, available);
            this.drawChildren(canvas, this._bounds);
            this.dirty = false;
        }

        /**
         * Draws the component within the available bounds
         *
         * @param canvas The image to draw the component on
         * @param available The available bounds in which the component will be drawn
         */
        drawSelf(canvas: Image, available: BoundingBox) {
            // Subclass
        }

        /**
         * Draws the children of the component within the available bounds
         *
         * @param canvas The image to draw the children on
         * @param available The available bounds in which the children will be drawn
         */
        drawChildren(canvas: Image, available: BoundingBox) {
            if (this.children) {
                for (let i = 0; i < this.children.length; i++) {
                    this.children[i].draw(canvas, available);
                }
            }
        }

        /**
         * Adds a child to this node
         *
         * @param n The Node to add
         */
        appendChild(n: Node) {
            if (!this.children) this.children = [];
            n.parent = this;
            this.children.push(n);
            this.notifyChange();
        }

        /**
         * Triggers a redraw of this Node (and possibly its parent in the tree)
         */
        notifyChange() {
            this.dirty = true;
            if (this.parent) {
                log(`childchanged`)
                this.parent.onChildDidChange(this);
            }
        }

        onChildDidChange(child: Node) {
            this.dirty = true;
            if (this.shouldBubbleChange(child)) {
                this.notifyChange();
            }
        }

        shouldBubbleChange(childThatUpdated: Node) {
            return !!this.parent;
        }

        update(dt: number) {
            // subclasses need to subscribe
        }

        /**
         * Disposes of the Node and its children
         */
        dispose() {
            const state = game.currentScene().menuState;
            if (!state) return;

            if (state.root == this) {
                game.popScene();
            }
            this.children.forEach(c => c.dispose());
            this.children = undefined;
        }

        /**
         * Gets the bounds for the children of this node
         *
         * @param bb The bounds passed to this node (e.g. from its parent)
         * @return The bounds available to children of this node
         */
        getBounds(bb: BoundingBox) {
            if (this.fixedWidth || this.fixedHeight || this.left || this.top) {
                return new BoundingBox(
                    bb.originX + this.left,
                    bb.originY + this.top,
                    this.fixedWidth || bb.width,
                    this.fixedHeight || bb.height);
            }
            return bb;
        }

        /**
         * Creates a linear timed Animation for this node
         *
         * @param cb The callback that the Animation will call on this node
         */
        animate(cb: (node: Node, value: number) => void) {
            return new Animation(this, cb);
        }
    }

    /**
     * A Node that simply constrains its children
     */
    export class Bounds extends Node {
        constructor(width: number, height: number) {
            super();
            this.fixedWidth = width;
            this.fixedHeight = height;
        }
    }

    /**
     * A Node that caches its content to an Image. Useful for nodes that
     * have complex (but mostly static) child trees
     */
    export class Container extends Node {
        image: Image;

        constructor(width: number, height: number) {
            super();
            width = width | 0;
            height = height | 0;
            this.fixedWidth = width;
            this.fixedHeight = height;
            this.image = image.create(width, height);
        }

        draw(canvas: Image, bb: BoundingBox) {
            if (this.dirty) {
                this._bounds = this.getBounds(bb);
                this.drawSelf(this.image, bb);
                this.drawChildren(this.image, new BoundingBox(0, 0, this.fixedWidth, this.fixedHeight));
            }
            canvas.drawTransparentImage(this.image, this._bounds.originX | 0, this._bounds.originY | 0);
            this.dirty = false;
        }

        shouldBubbleChange(childThatUpdated: Node) {
            return true;
        }
    }

    /**
     * A Node that prints text
     */
    export class TextNode extends Node {
        protected font: image.Font;
        protected content: string;
        protected color: number;

        /**
         * Creates a TextNode
         *
         * @param font The font for the text
         * @param content The text to print
         * @param color The color index to use when printing the text
         */
        constructor(font: image.Font, content: string, color: number) {
            super();
            this.font = font;
            this.content = content;
            this.color = color;

            this.fixedWidth = this.content.length * font.charWidth - 1;
            this.fixedHeight = font.charHeight;
        }

        drawSelf(canvas: Image, bb: BoundingBox) {
            canvas.print(
                this.content,
                this._bounds.originX | 0,
                this._bounds.originY | 0,
                this.color,
                this.font)
        }
    }

    /**
     * A simple rectangle node with a single color
     */
    export class RectNode extends Node {
        color: number;

        /**
         * Creates a RectNode
         *
         * @param color The color to draw the rectangle with
         */
        constructor(color: number) {
            super();
            this.color = color;
        }

        drawSelf(canvas: Image, bb: BoundingBox) {
            canvas.fillRect(
                this._bounds.originX | 0,
                this._bounds.originY | 0,
                this.width | 0,
                this.height | 0,
                this.color);
        }
    }

    /**
     * A Container that lays out its children in a vertical flow. Children
     * are given bounds of equal height
     */
    export class VerticalFlow extends Container {
        drawChildren(canvas: Image, available: BoundingBox) {
            if (this.children) {
                let yOffset = 0;
                for (let i = 0; i < this.children.length; i++) {
                    const c = this.children[i];
                    const bb = new BoundingBox(available.originX, yOffset, this.width, c.height);
                    c.draw(canvas, bb);
                    yOffset += c.height;
                }
            }
        }
    }

    /**
     * A Container that lays out its children in a horizontal flow. Children
     * are given bounds of equal width
     */
    export class HorizontalFlow extends Container {
        drawChildren(canvas: Image, available: BoundingBox) {
            if (this.children) {
                let xOffset = 0;
                for (let i = 0; i < this.children.length; i++) {
                    const c = this.children[i];
                    const bb = new BoundingBox(xOffset, available.originY, c.width, this.height);
                    c.draw(canvas, bb);
                    xOffset += c.width;
                }
            }
        }
    }

    /**
     * A Node that justifies its children Node within its bounds. Should
     * only be used with Nodes that have a fixed width/height
     */
    export class JustifiedContent extends Node {
        xAlign: Alignment;
        yAlign: Alignment;

        /**
         * Creates a JustifiedContent Node
         *
         * @param content The child node to justify
         * @param xAlignment The alignment along the X-Axis
         * @param yAlignment The alignment along the Y-Axis
         */
        constructor(content: Node, xAlignment: Alignment, yAlignment: Alignment) {
            super();

            this.xAlign = xAlignment;
            this.yAlign = yAlignment;

            this.appendChild(content);
        }

        drawChildren(canvas: Image, bb: BoundingBox) {
            this.moveChild();
            super.drawChildren(canvas, bb);
        }

        protected moveChild() {
            const content = this.children[0];

            switch (this.xAlign) {
                case Alignment.Left:
                    content.left = 0;
                    break;
                case Alignment.Right:
                    content.left = this.width - content.width;
                    break;
                case Alignment.Center:
                    content.left = ((this.width - content.width) / 2);
                    break;
            }

            switch (this.yAlign) {
                case Alignment.Top:
                    content.top = 0;
                    break;
                case Alignment.Bottom:
                    content.top = this.height - content.height;
                    break;
                case Alignment.Center:
                    content.top = ((this.height - content.height) / 2);
                    break;
            }
        }
    }

    export class Label extends Container {
        fullString: string;
        font: image.Font;
        color: number;
        text: TextNode;

        constructor(width: number, font: image.Font, content: string) {
            super(width, font.charHeight);
            this.fullString = content;
            this.font = font;

            this.text = new TextNode(this.font, content, 1);
            this.appendChild(this.text);
        }
    }

    /**
     * A label that scrolls its content in a loop
     */
    export class ScrollingLabel extends Label {
        pause: number;
        speed: number;
        timer: number;

        maxOffset: number;

        private _scrolling: boolean;
        private _offset: number;

        get scrolling() {
            return this._scrolling;
        }

        set scrolling(v: boolean) {
            if (v === this._scrolling) return;
            this._scrolling = v;
            this.timer = this.pause;

            if (this.offset !== 0) {
                this.offset = 0;
                this.notifyChange();
            }
        }

        get offset() {
            return this._offset;
        }

        set offset(o: number) {
            this._offset = 0;
            this.text.left = -(o | 0);
        }

        constructor(width: number, font: image.Font, content: string) {
            super(width, font, content);
            this.pause = 750;
            this.speed = 1 / 100;
            this.offset = 0;
            this.timer = this.pause;
            this.scrolling = false;

            this.maxOffset = content.length * this.font.charWidth - this.width;

            if (this.maxOffset > 0) subscribe(this);
        }

        update(dt: number) {
            if (this.width <= this.maxOffset) {
                return;
            }

            if (this.timer > 0) {
                this.timer -= dt;

                if (this.timer <= 0 && this.offset) {
                    this.offset = 0;
                    this.timer = this.pause;
                }
            }
            else {
                this.offset += dt * this.speed;

                if (this.offset > this.maxOffset) {
                    this.offset = this.maxOffset;
                    this.timer = this.pause;
                }

                this.notifyChange();
            }
        }

        dispose() {
            super.dispose();
            unsubscribe(this);
        }
    }

    /**
     * A Node that can receive input
     */
    export class Component extends Node {
        visible: boolean;

        constructor() {
            super();
            this.visible = false;
        }

        draw(canvas: Image, available: BoundingBox) {
            if (this.visible) super.draw(canvas, available);
            this.dirty = false;
        }

        show() {
            if (this.visible) return;
            this.visible = true;
            this.onShown();
            this.notifyChange();
        }

        hide() {
            if (!this.visible) return;
            this.visible = false;
            this.onHidden();
            this.notifyChange();
        }

        onShown() {

        }

        onHidden() {

        }

        onFocus() {

        }

        onBlur() {

        }

        handleInput(button: number): boolean {
            return true;
        }

        dispose() {
            super.dispose();
            disposeComponent(this);
        }
    }

    export class ListItem extends Component {
        content: JustifiedContent;
        label: ScrollingLabel;
        background: RectNode;
        id: number;
        handler: () => void;

        constructor(labelWidth: number, text: string, id: number) {
            super();

            this.background = new RectNode(0);
            this.appendChild(this.background);

            this.label = new ScrollingLabel(labelWidth, image.font8, text);
            this.appendChild(new JustifiedContent(this.label, Alignment.Left, Alignment.Center));

            this.id = id;
            this.visible = true;
        }

        get selected() {
            return this.background.color != 0;
        }

        set selected(value: boolean) {
            const sel = this.background.color != 0;
            if (sel != value) {
                this.background.color = value ? 10 : 0;
                this.label.color = value ? 1 : 2;
                this.notifyChange();
            }
        }
    }

    export class VerticalList extends Component {
        flow: VerticalFlow;
        private items: ListItem[];

        constructor(outerWidth: number, outerHeight: number, innerWidth?: number, innerHeight?: number) {
            super();
            this.fixedWidth = outerWidth;
            this.fixedHeight = outerHeight;

            if (!innerWidth) innerWidth = outerWidth;
            if (!innerHeight) innerHeight = outerHeight;

            this.flow = new VerticalFlow(innerWidth, innerHeight);
            this.items = [];

            const padding = new JustifiedContent(this.flow, Alignment.Center, Alignment.Center);
            this.appendChild(padding);
        }

        get length() {
            return this.items.length;
        }

        addItem(item: string, id: number): ListItem {
            const n = new ListItem(this.flow.width, item, id);
            n.fixedHeight = 16;
            this.items.push(n);
            this.flow.appendChild(n);
            return n;
        }

        get selectedItemIndex(): number {
            for (let i = 0; i < this.items.length; ++i) {
                const item = this.items[i];
                if (item.selected)
                    return i;
            }
            return -1;
        }

        set selectedItemIndex(value: number) {
            for (let i = 0; i < this.items.length; ++i) {
                const item = this.items[i];
                const select = value == i;
                if (select != item.selected) {
                    item.selected = select;
                    //if (item.selected)
                    //    focus(item, true);
                }
            }
        }

        get selectedItem(): ListItem {
            for (let i = 0; i < this.items.length; ++i) {
                const item = this.items[i];
                if (item.selected)
                    return item;
            }
            return undefined;
        }

        handleInput(button: ButtonId) {
            log(`list input ${button}`)
            switch (button) {
                case ButtonId.A:
                    const item = this.selectedItem;
                    if (item && item.handler)
                        item.handler();
                    break;
                case ButtonId.Down:
                    for (let i = 0; i < this.items.length - 1; ++i) {
                        const item = this.items[i];
                        if (item.selected) {
                            item.selected = false;
                            i = i + 1;
                            this.items[i].selected = true;
                            focus(this.items[i], true);
                            break;
                        }
                    }
                    break;
                case ButtonId.Up:
                    for (let i = 1; i < this.items.length; ++i) {
                        const item = this.items[i];
                        if (item.selected) {
                            item.selected = false;
                            i = i - 1;
                            this.items[i].selected = true;
                            focus(this.items[i], true);
                            break;
                        }
                    }
                    break;
            }
            return true;
        }
    }

    export class FrameSource {
        source: Image;

        rw: number;
        lw: number;
        th: number;
        bh: number;

        constructor(source: Image) {
            this.source = source;

            const vUnit = (source.height / 3) | 0;
            this.th = vUnit;
            this.bh = vUnit;

            const hUnit = (source.width / 3) | 0;
            this.rw = hUnit;
            this.lw = hUnit;
        }

        getBounds(width: number, height: number) {
            return new BoundingBox(
                this.lw,
                this.th,
                width - this.rw - this.lw,
                height - this.bh - this.th);
        }

        drawPartial(canvas: Image, ox: number, oy: number, x: number, y: number, w: number, h: number) {
            for (let i = 0; i < w; i++) {
                for (let j = 0; j < h; j++) {
                    canvas.setPixel(ox + i, oy + j, this.source.getPixel(x + i, y + j));
                }
            }
        }

        draw(canvas: Image, bb: BoundingBox, innerFill: number) {
            const cl = bb.originX
            const ct = bb.originY;
            const cr = bb.originX + bb.width - this.rw;
            const cb = bb.originY + bb.height - this.bh;

            const sr = this.source.width - this.rw;
            const sb = this.source.height - this.bh;

            this.drawPartial(canvas, cl, ct, 0, 0, this.lw, this.th);
            this.drawPartial(canvas, cr, ct, sr, 0, this.rw, this.th);
            this.drawPartial(canvas, cr, cb, sr, sb, this.rw, this.bh);
            this.drawPartial(canvas, cl, cb, 0, sb, this.lw, this.bh);

            const innerWidth = bb.width - this.rw - this.lw;
            this.drawHorizontal(canvas, cl + this.lw, ct, innerWidth, true);
            this.drawHorizontal(canvas, cl + this.lw, cb, innerWidth, false);

            const innerHeight = bb.height - this.bh - this.th;
            this.drawVertical(canvas, cl, ct + this.th, innerHeight, true);
            this.drawVertical(canvas, cr, ct + this.th, innerHeight, false);

            canvas.fillRect(cl + this.lw, ct + this.th, innerWidth, innerHeight, innerFill);
        }

        drawHorizontal(canvas: Image, ox: number, oy: number, width: number, useTop: boolean) {
            const x = this.lw;
            const y = useTop ? 0 : this.source.height - this.bh;
            const sourceWidth = this.source.width - this.lw - this.rw;
            const sourceHeight = useTop ? this.th : this.bh;

            for (let column = 0; column < width; column++) {
                for (let row = 0; row < sourceHeight; row++) {
                    canvas.setPixel(
                        ox + column,
                        oy + row,
                        this.source.getPixel(x + (column % sourceWidth), y + row)
                    )
                }
            }
        }

        drawVertical(canvas: Image, ox: number, oy: number, height: number, useLeft: boolean) {
            const x = useLeft ? 0 : this.source.width - this.rw;
            const y = this.th;
            const sourceWidth = useLeft ? this.lw : this.rw;
            const sourceHeight = this.source.height - this.th - this.bh;

            for (let column = 0; column < sourceWidth; column++) {
                for (let row = 0; row < height; row++) {
                    canvas.setPixel(
                        ox + column,
                        oy + row,
                        this.source.getPixel(x + column, y + (row % sourceHeight))
                    )
                }
            }
        }
    }

    export class Frame extends Node {
        source: FrameSource;
        innerFill: number;

        constructor(source: FrameSource, innerFill: number) {
            super();
            this.source = source;
            this.innerFill = innerFill;
        }

        drawSelf(canvas: Image, available: BoundingBox) {
            this.source.draw(canvas, available, this.innerFill);
        }

        getBounds(available: BoundingBox) {
            const width = this.fixedWidth || available.width;
            const height = this.fixedHeight || available.height;
            return this.source.getBounds(width, height);
        }
    }

    export class RoundedFrame extends Frame {
        constructor(cornerRadius: number, borderColor: number, innerFill: number) {
            super(mkRoundedFrame(cornerRadius, borderColor, innerFill), innerFill);
        }
    }

    function mkRoundedFrame(radius: number, borderColor: number, innerFill: number) {
        const result = image.create((radius << 1) + 1, (radius << 1) + 1);
        drawCircle(result, radius, radius, radius, borderColor);

        for (let x = 1; x < result.width - 1; x++) {
            let s = 0;
            for (let y = 0; y < result.height; y++) {
                if (result.getPixel(x, y)) {
                    if (!s) {
                        s = 1;
                    }
                    else if (s === 2) {
                        s = 3;
                    }
                }
                else if (s === 1) {
                    s = 2;
                }

                if (s === 2) {
                    result.setPixel(x, y, innerFill);
                }
            }
        }

        const source = new FrameSource(result);
        source.lw = radius;
        source.rw = radius;
        source.th = radius;
        source.bh = radius;

        return source;
    }

    // https://en.wikipedia.org/wiki/Midpoint_circle_algorithm
    function drawCircle(canvas: Image, x0: number, y0: number, radius: number, color: number) {
        let x = radius;
        let y = 0;
        let err = 0;

        while (x >= y) {
            canvas.setPixel(x0 + x, y0 + y, color);
            canvas.setPixel(x0 + x, y0 - y, color);
            canvas.setPixel(x0 + y, y0 + x, color);
            canvas.setPixel(x0 + y, y0 - x, color);
            canvas.setPixel(x0 - y, y0 + x, color);
            canvas.setPixel(x0 - y, y0 - x, color);
            canvas.setPixel(x0 - x, y0 + y, color);
            canvas.setPixel(x0 - x, y0 - y, color);

            if (err <= 0) {
                y += 1;
                err += 2 * y + 1;
            }
            if (err > 0) {
                x -= 1;
                err -= 2 * x + 1;
            }
        }
    }

    export function setWidth(node: menu.Node, value: number) {
        node.fixedWidth = value;
    }

    export function setHeight(node: menu.Node, value: number) {
        node.fixedHeight = value;
    }

    export class Menu extends Node {
        list: menu.VerticalList;
        root: menu.JustifiedContent;
        b: menu.Bounds;
        margin: number;
        onHidden?: () => void;

        constructor() {
            super();
            this.margin = 10;

            const initHeight = this.margin;
            const finalHeight = screen.height - this.margin;
            const finalWidth = screen.width - this.margin;

            this.b = new menu.Bounds(initHeight, initHeight);
            const f = new menu.RoundedFrame(5, 1, 3);
            this.b.left = 30;
            this.b.top = 30;
            this.b.appendChild(f)

            this.list = new menu.VerticalList(finalWidth - 8, finalHeight - 8, finalWidth - 24, finalHeight - 24);
            f.appendChild(this.list);
            this.root = new menu.JustifiedContent(this.b, Alignment.Center, Alignment.Center);
            this.appendChild(this.root);
        }

        addItem(name: string, handler: () => void) {
            const item = this.list.addItem(name, this.list.length);
            this.list.selectedItemIndex = 0;
            item.handler = handler;
        }

        private grow() {
            this.list.hide();
            const vert = this.b.animate(menu.setHeight)
                .from(this.margin)
                .to(screen.height - this.margin)
                .duration(200);
            const hori = this.b.animate(menu.setWidth)
                .from(this.margin)
                .to(screen.width - this.margin)
                .duration(200)
                .onEnded(() => {
                    console.log(`show list`)
                    this.list.show();
                    focus(this.list.selectedItem, true);
                });
            vert.chain(hori);
            vert.start();
        }

        hide() {
            this.list.hide();
            const hori = this.b.animate(menu.setWidth)
                .from(150)
                .to(0)
                .duration(200)
            const vert = this.b.animate(menu.setHeight)
                .from(100)
                .to(this.margin)
                .duration(200)
                .onEnded(() => {
                    this.dispose();
                    if (this.onHidden)
                        this.onHidden();
                });
            hori.chain(vert);
            hori.start();
        }

        show() {
            menu.setRoot(this);
            this.grow();
        }

        handleInput(button: number) {
            log(`input menu ${button}`)
            if (button == ButtonId.B)
                this.hide();
            return true;
        }
    }
}

// const container = new Menu.HorizontalFlow(100, 100);

// const columns = 4;
// const rows = 4;

// for (let c = 0; c < columns; c++) {
//     const column = new Menu.VerticalFlow(container.width / columns, container.height);
//     container.appendChild(column)
//     for (let r = 0; r < rows; r++) {
//         const rect = new Menu.RectNode(((c + r) & 1) ? 7 : 6);
//         const text = new Menu.TextNode(image.font5, `(${c},${r})`, 1);
//         rect.appendChild(text);
//         column.appendChild(new Menu.JustifiedContent(rect, Alignment.Center, Alignment.Center));
//     }
// }

// Menu.setRoot(container);



// const commands = [
//     "MOVE",
//     "TALK",
//     "FLEE",
//     "ITEM"
// ];

// const root = new Menu.VerticalList(screen.width, screen.height, screen.width >> 2, screen.height >> 1);
// commands.forEach(function (value: string, index: number) {
//     root.addItem(value, index);
// })
// Menu.setRoot(root);
// root.show();

// const initHeight = 12;
// const f = new Menu.RoundedFrame(5, 1, 3);
// const b = new Menu.Bounds(initHeight, initHeight);
// b.left = 30;
// b.top = 30;
// b.appendChild(f)

// controller.A.onEvent(ControllerButtonEvent.Pressed, () => {
//     const vert = b.animate(setHeight)
//         .from(initHeight)
//         .to(100)
//         .duration(200);

//     const hori = b.animate(setWidth)
//         .from(initHeight)
//         .to(150)
//         .duration(200);

//     vert.chain(hori);
//     vert.start();
// })

// controller.B.onEvent(ControllerButtonEvent.Pressed, () => {
//     const vert = b.animate(setHeight)
//         .from(100)
//         .to(initHeight)
//         .duration(200);

//     const hori = b.animate(setWidth)
//         .from(150)
//         .to(initHeight)
//         .duration(200);

//     hori.chain(vert);
//     hori.start();
// })

// const root = new Menu.JustifiedContent(b, Alignment.Center, Alignment.Center);
// Menu.setRoot(root);
