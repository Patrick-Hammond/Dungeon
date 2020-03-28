import {Rectangle} from "pixi.js";
import ObjectPool from "../../../../../_lib/patterns/ObjectPool";
import {ISkinUI} from "../../skins/ISkinUI";
import BaseContainer from "../BaseContainer";
import ListItemBase from "./ListBoxItemBase";

export const enum ListBoxEvents {
    ITEM_SELECTED = "item_selected",
    TOGGLE_VISIBILITY = "toggleVisibility"
}

export class ListBox<T extends ListItemBase> extends BaseContainer {
    private selections: ObjectPool<T>;

    constructor(itemCtor: () => T, bounds: Rectangle, skin: ISkinUI) {
        super(bounds, skin);

        this.selections = new ObjectPool<T>(5, () => itemCtor());
    }

    Set(items: { id: number; name: string; selected: boolean; visible: boolean }[]): void {
        this.selections.Popped.forEach(item => this.removeChild(item));
        this.selections.RestoreAll();

        items.forEach((item, index) => {
            const listItem = this.selections.Get();
            listItem.index = index;
            listItem.Update(item);
            this.addChild(listItem);
        });
    }
}
