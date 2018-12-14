import Store, {IAction} from "../../../../_lib/Store";
import Game from "../../../../_lib/Game";
import {TileSize} from "../Constants";
import {Point, Brush} from "../Types";

export const enum EditorActions
{
    BRUSH_MOVED, BRUSH_MOUSE_DOWN, ROTATE_BRUSH,
    BRUSH_CHANGED, BRUSH_HOVERED,
    ZOOM_IN, ZOOM_OUT,
    REFRESH
};

export const enum MouseButtonState
{
    LEFT_DOWN, RIGHT_DOWN, UP
}

type ActionData = {mouseButtonState?: MouseButtonState, name?: string, position?: Point, rotation?: number, layer?: number};

interface ILayoutState
{
    scale: number;
    gridBounds: PIXI.Rectangle;
    scaledTileSize: number;
}

export interface IState extends ILayoutState
{
    mouseButtonState: MouseButtonState;
    currentBrush: Brush;
    hoveredBrushName: string,
}

export default class EditorStore extends Store<IState, ActionData>
{
    protected DefaultState(): IState
    {
        return {
            mouseButtonState: MouseButtonState.UP,
            currentBrush: {name: "", position: {x: 0, y: 0}, pixelOffset: {x: 0, y: 0}, rotation: 0},
            hoveredBrushName: "",
            scale: 1.5,
            gridBounds: new PIXI.Rectangle(),
            scaledTileSize: 16
        };
    }

    protected Reduce(state: IState, action: IAction<ActionData>): IState
    {
        let newState = {
            mouseButtonState: this.UpdateMouseButton(state.mouseButtonState, action),
            currentBrush: this.UpdateBrush(state.currentBrush, action),
            hoveredBrushName: this.UpdateHoveredBrushName(state.hoveredBrushName, action),
            ...this.UpdateLayout(state, action)
        };
        return newState as IState;
    }

    private UpdateMouseButton(mouseButtonDown: MouseButtonState, action: IAction<ActionData>): MouseButtonState
    {
        switch(action.type) {
            case EditorActions.BRUSH_MOUSE_DOWN:
                return action.data.mouseButtonState;
            default:
                return mouseButtonDown != null ? mouseButtonDown : this.DefaultState().mouseButtonState;
        }
    }

    private UpdateBrush(currentBrush: Brush, action: IAction<ActionData>): Brush
    {
        switch(action.type) {
            case EditorActions.BRUSH_MOVED:
                {
                    return {
                        ...currentBrush,
                        position: action.data.position
                    };
                }
            case EditorActions.BRUSH_CHANGED:
                {
                    return {
                        ...currentBrush,
                        name: action.data.name
                    };
                }
            case EditorActions.ROTATE_BRUSH:
                {
                    return {
                        ...currentBrush,
                        rotation: currentBrush.rotation + Math.PI / 2
                    };
                }
            default:
                return currentBrush || this.DefaultState().currentBrush;
        }
    }

    private UpdateHoveredBrushName(hoveredBrushName: string, action: IAction<ActionData>): string
    {
        switch(action.type) {
            case EditorActions.BRUSH_HOVERED:
                return action.data.name;
            default:
                return hoveredBrushName || this.DefaultState().hoveredBrushName;
        }
    }

    private UpdateLayout(state: ILayoutState, action: IAction<{}>): ILayoutState
    {
        const calc = (scale: number): ILayoutState =>
        {
            let scaledTileSize = TileSize * scale;
            let screen = Game.inst.screen;
            let w = (screen.width * 0.8) - scaledTileSize;
            let h = (screen.height * 0.9) - scaledTileSize;
            let gridBounds = new PIXI.Rectangle(scaledTileSize, scaledTileSize, w - w % scaledTileSize, h - h % scaledTileSize);
            return {
                scale: scale,
                gridBounds: gridBounds,
                scaledTileSize: scaledTileSize
            };
        }

        switch(action.type) {
            case EditorActions.ZOOM_IN:
                return calc(state.scale + 0.25);
            case EditorActions.ZOOM_OUT:
                return calc(Math.max(state.scale - 0.25, 0.25));
            default:
                return state.scale ? calc(state.scale) : calc(this.DefaultState().scale);
        }
    }
}