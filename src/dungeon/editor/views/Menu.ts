import {Text} from "pixi.js";
import { Scenes } from "../../Constants";
import EditorComponent from "../EditorComponent";

export default class Menu extends EditorComponent {
    constructor() {
        super();
        this.AddToScene(Scenes.EDITOR);
    }

    protected Create(): void {
        const text =
            "PAINT - left mouse   ERASE - right mouse   ROTATE BRUSH - r   NUDGE BRUSH - cursor keys   " +
            "UNDO - ctrl-z   ZOOM - +/- or mouse wheel   SAVE - s   LOAD - l   RESET - ctrl-q";
        const helpText = new Text(text, { fontFamily: "Arial", fontSize: 11, fill: 0xaaaaaa });
        helpText.position.set(20, 702);
    }
}
