import pts from "./pts.js";
var TEST;
(function (TEST) {
    TEST[TEST["Outside"] = 0] = "Outside";
    TEST[TEST["Inside"] = 1] = "Inside";
    TEST[TEST["Overlap"] = 2] = "Overlap";
})(TEST || (TEST = {}));
class aabb2 {
    static TEST = TEST;
    min;
    max;
    static dupe(bb) {
        return new aabb2(bb.min, bb.max);
    }
    constructor(a, b) {
        this.min = this.max = [...a];
        if (b) {
            this.extend(b);
        }
    }
    extend(v) {
        this.min = pts.min(this.min, v);
        this.max = pts.max(this.max, v);
    }
    diagonal() {
        return pts.subtract(this.max, this.min);
    }
    center() {
        return pts.add(this.min, pts.mult(this.diagonal(), 0.5));
    }
    translate(v) {
        this.min = pts.add(this.min, v);
        this.max = pts.add(this.max, v);
    }
    test(b) {
        if (this.max[0] < b.min[0] || this.min[0] > b.max[0] ||
            this.max[1] < b.min[1] || this.min[1] > b.max[1])
            return 0;
        if (this.min[0] <= b.min[0] && this.max[0] >= b.max[0] &&
            this.min[1] <= b.min[1] && this.max[1] >= b.max[1])
            return 1;
        return 2;
    }
}
export default aabb2;
