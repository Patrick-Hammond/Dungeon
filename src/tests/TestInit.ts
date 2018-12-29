import {expect} from "chai";
import * as mocha from "mocha";
import {PointLike} from "../_lib/math/Geometry";
import {AddTypes, MultiplyTypes, SubtractTypes} from "../_lib/utils/EnumerateTypes";

class TesterInit {

    constructor() {
        describe("enumerate types", () => {

            const point1: PointLike = {x: 10, y: 10};
            const point2: PointLike = {x: 5, y: 5};
            const mixed1 = {name: "jason", x: 5, y: 5};
            const mixed2 = {name: "edgar", valid: true, x: 25, y: 25};

            it("add two points", () => {
                expect(AddTypes(point1, point2)).to.deep.equal({x: 15, y: 15});
            });
            it("subtract two points", () => {
                expect(SubtractTypes(point1, point2)).to.deep.equal({x: 5, y: 5});
            });
            it("multiply two points", () => {
                expect(MultiplyTypes(point1, point2)).to.deep.equal({x: 50, y: 50});
            });
            it("add point and mixed point", () => {
                expect(AddTypes(point1, mixed1)).to.deep.equal({x: 15, y: 15});
            });
            it("add point and mixed point", () => {
                expect(AddTypes(point1, mixed1)).to.deep.equal({x: 15, y: 15});
            });
            it("add two mixed points", () => {
                expect(AddTypes(mixed1 as PointLike, mixed2)).to.deep.equal({x: 30, y: 30});
            });
            it("multiply two mixed points", () => {
                expect(MultiplyTypes(mixed1 as PointLike, mixed2)).to.deep.equal({x: 125, y: 125});
            });
        });
    }
}

new TesterInit();
