import EditorComponent from "../EditorComponent";
import {AnimationSpeed, TileSize, GridBounds, InitalScale} from "../Constants";
import {ILevelDataState, LevelDataActions} from "../stores/LevelDataStore";
import {IState, EditorActions} from "../stores/EditorStore";

export class Canvas extends EditorComponent {
    private grid: PIXI.Graphics = new PIXI.Graphics();
    private mask: PIXI.Graphics = new PIXI.Graphics();
    private levelContainer = new PIXI.Container();

    constructor() {
        super();

        this.root.addChild(this.grid, this.levelContainer, this.mask);
        this.levelContainer.mask = this.mask;

        this.AddToStage();

        this.levelDataStore.Subscribe(this.UpdateLevel, this);
        this.editorStore.Subscribe(this.UpdateLayout, this);

        let paint = (type: LevelDataActions) => {
            let currentBrush = this.editorStore.state.currentBrush;
            if(currentBrush.name != "") {
                this.levelDataStore.Dispatch({type: type, data: {brush: currentBrush, viewOffset: this.editorStore.state.viewOffset}, canUndo: true});
            }
        }

        this.grid.interactive = true;
        this.grid.on("mousedown", (e: PIXI.interaction.InteractionEvent) => {
            if(!this.editorStore.state.spaceKeyDown) {
                paint(LevelDataActions.PAINT);
            }
        });
        this.grid.on("rightdown", (e: PIXI.interaction.InteractionEvent) => paint(LevelDataActions.ERASE));

        //mouse wheel zooming
        this.game.view.onwheel = (e: WheelEvent) => {
            if(GridBounds.contains(e.offsetX, e.offsetY)) {

                let oldScale = this.editorStore.state.scale;

                if(e.deltaY < 0) {
                    this.editorStore.Dispatch({type: EditorActions.ZOOM_IN});
                }
                else if(e.deltaY > 0) {
                    this.editorStore.Dispatch({type: EditorActions.ZOOM_OUT});
                }

                //adjust offset to zoom in and out of the cursor position
                let pos = this.game.interactionManager.mouse.global;
                let percentPos = {x: (pos.x - GridBounds.x) / GridBounds.width, y: (pos.y - GridBounds.y) / GridBounds.height};

                let oldScaledTileSize = TileSize * oldScale;
                let newScaledTileSize = TileSize * this.editorStore.state.scale;

                let widthDelta = (GridBounds.width / oldScaledTileSize) * newScaledTileSize - GridBounds.width;
                let heightDelta = (GridBounds.height / oldScaledTileSize) * newScaledTileSize - GridBounds.height;

                let moveDistance = {x: Math.round((widthDelta / oldScaledTileSize) * percentPos.x), y: Math.round((heightDelta / oldScaledTileSize) * percentPos.y)};

                this.editorStore.Dispatch({type: EditorActions.VIEW_MOVE, data: {move: moveDistance}});
                this.levelDataStore.Dispatch({type: LevelDataActions.REFRESH});
            }
        }

        this.RedrawGrid(InitalScale);
    }

    private UpdateLayout(prevState: IState, state: IState): void {
        if(prevState.scale != state.scale) {
            this.RedrawGrid(state.scale);
        }
        if(prevState.spaceKeyDown != state.spaceKeyDown) {
            //this.game.interactionManager.setCursorMode(state.spaceKeyDown ? "grab" : "default");
        }
    }

    private UpdateLevel(prevState: ILevelDataState, state: ILevelDataState): void {
        if(prevState.levelData != state.levelData) {
            this.levelContainer.removeChildren();

            const scale = this.editorStore.state.scale;
            const scaledTileSize = TileSize * scale;
            const viewOffset = this.editorStore.state.viewOffset;

            state.levelData.forEach(brush => {
                let sprite = this.assetFactory.Create(brush.name);
                let posX = (brush.position.x - viewOffset.x) * scaledTileSize + GridBounds.x;
                let posY = (brush.position.y - viewOffset.y) * scaledTileSize + GridBounds.y;

                if(GridBounds.contains(posX, posY)) {
                    sprite.position.set(posX, posY);
                    sprite.rotation = brush.rotation;
                    sprite.pivot.set(brush.pixelOffset.x, brush.pixelOffset.y);
                    sprite.scale.set(scale);
                    if(sprite instanceof PIXI.extras.AnimatedSprite) {
                        sprite.play();
                        sprite.animationSpeed = AnimationSpeed;
                    }
                    this.levelContainer.addChild(sprite);
                }
            });
        }
    }

    private RedrawGrid(scale: number): void {
        const margin = GridBounds.x;
        const scaledTileSize = TileSize * scale;

        this.grid.clear().beginFill(0x222222, 0.5).drawShape(GridBounds);
        this.mask.clear().beginFill(0xff).drawShape(GridBounds);

        for(let col = 0; col <= GridBounds.width; col += scaledTileSize) {
            this.grid.lineStyle(1, 0x999999, 0.1);
            this.grid.moveTo(col + margin, margin).lineTo(col + margin, GridBounds.height + margin);
        }

        for(let row = 0; row <= GridBounds.height; row += scaledTileSize) {
            this.grid.lineStyle(1, 0x999999, 0.1);
            this.grid.moveTo(margin, row + margin).lineTo(GridBounds.width + margin, row + margin);
        }
    }
}