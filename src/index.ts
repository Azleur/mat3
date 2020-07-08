import { Vec2 } from "@azleur/vec2";
import { Vec3 } from "@azleur/vec3";
import { IsEpsilon } from "@azleur/math-util";

const zeroValues = () => [[0, 0, 0], [0, 0, 0], [0, 0, 0]];

export class Mat3 {
    values: number[][];

    // TODO: Is per-term constructor even worth it?
    constructor(values: number[][]);
    constructor(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number);
    constructor(a: number | number[][], b?: number, c?: number, d?: number, e?: number, f?: number, g?: number, h?: number, i?: number) {
        if (a instanceof Array) {
            this.values = a; // TODO: We're trusting the  array has the correct size. Check?
        } else {
            this.values = [[a, b!, c!], [d!, e!, f!], [g!, h!, i!]];
        }
    }

    static get Zero() { return new Mat3([[0, 0, 0], [0, 0, 0], [0, 0, 0]]); }
    static get Id  () { return new Mat3([[1, 0, 0], [0, 1, 0], [0, 0, 1]]); }
    static get Ones() { return new Mat3([[1, 1, 1], [1, 1, 1], [1, 1, 1]]); }

    /** Return a deep copy of this matrix. */
    Clone(): Mat3 {
        const [r1, r2, r3] = this.values;
        const newValues = [[...r1], [...r2], [...r3]];
        return new Mat3(newValues);
    }

    /** Return a transposed copy of this matrix. */
    Transpose(): Mat3 {
        const values: number[][] = zeroValues();
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                values[i][j] = this.values[j][i];
            }
        }
        return new Mat3(values);
    }

    /** Return a negative copy of this matrix (swap signs). */
    Negate(): Mat3 {
        const values: number[][] = zeroValues();
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                values[i][j] = -this.values[i][j];
            }
        }
        return new Mat3(values);
    }

    /** Returns a copy of (this + mat). */
    Add(mat: Mat3): Mat3 {
        const values: number[][] = zeroValues();
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                values[i][j] = this.values[i][j] + mat.values[i][j];
            }
        }
        return new Mat3(values);
    }

    /** Returns a copy of (this - mat). */
    Sub(mat: Mat3): Mat3 {
        return this.Add(mat.Negate());
    }

    /** Return a copy of the scalar product (this * num). */
    TimesNum(num: number): Mat3 {
        const values: number[][] = zeroValues();
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                values[i][j] = num * this.values[i][j];
            }
        }
        return new Mat3(values);
    }

    /** Return a copy of the matrix product (this * mat). */
    TimesMat(mat: Mat3): Mat3 {
        const values: number[][] = zeroValues();
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                for (let k = 0; k < 3; k++) {
                    values[i][j] += this.values[i][k] * mat.values[k][j];

                }
            }
        }
        return new Mat3(values);
    }

    /** Return a copy of the matrix * vector product (this * vec). */
    TimesVec(vec: Vec3): Vec3 {
        const values: number[] = [0, 0, 0];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                values[i] += this.values[i][j] * vec.values[j];
            }
        }
        return new Vec3(values);
    }

    /** Return the sum of the diagonal. */
    Trace(): number {
        let value = 0;
        for (let i = 0; i < 3; i++) {
            value += this.values[i][i];
        }
        return value;
    }

    /** Return the determinant of this matrix. */
    Determinant(): number {
        const [[a11, a12, a13], [a21, a22, a23], [a31, a32, a33]] = this.values;
        return + a11 * a22 * a33
               + a12 * a23 * a31
               + a13 * a21 * a32
               - a31 * a22 * a13
               - a32 * a23 * a11
               - a33 * a21 * a12;
    }

    /** Returns the rank of this matrix. */
    // Rank(): number {
    //     if(this.Determinant() !== 0) {
    //         return 3;
    //     }

    //     TO DO

    //     return 0;
    // }

    /** Calculates the inverse of this matrix, if it exists. */
    Invert(): Mat3 {
        const matrix : number[][] = this.Clone().values;
        const inverse: number[][] = Mat3.Id.values;

        for (let i = 0; i < 3; i++) { // For each column...

            // Find first non-zero row below the diagonal (including diagonal), and swap it into the diagonal.
            let di;
            for (di = 0; i + di < 3; di++) {
                const entry = matrix[i + di][i];
                if (!IsEpsilon(entry)) break; // entry != 0
            }
            // TODO: THROW IF di == 3?
            if (di > 0) {
                swapRows(matrix , i, i + di);
                swapRows(inverse, i, i + di);
            }

            // Reduce to 1 in the diagonal.
            const scale = 1 / matrix[i][i];
            scaleRow(matrix , i, scale);
            scaleRow(inverse, i, scale);

            // Remove column in all other rows
            for (let j = 0; j < 3; j++) {
                if(i == j) continue;
                const leadingValue = matrix[j][i];
                if (!IsEpsilon(leadingValue)) { // If value != 0
                    combineRows(matrix , i, -leadingValue, j);
                    combineRows(inverse, i, -leadingValue, j);
                }
            }
        }

        return new Mat3(inverse);
    }
}

/**
 * Calculate the 2D affine rotation matrix (projective representation) for a given angle, in radians.
 *
 * @param theta Angle, in radians.
 * @returns Rotation matrix.
 */
export const Rotation2D = (theta: number): Mat3 => {
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    return new Mat3([
        [c, -s, 0],
        [s,  c, 0],
        [0,  0, 1]
    ]);
};

/** Calculate the 2D affine translation matrix (projective representation) for a given displacement. */
export const Translation = (displacement: Vec2): Mat3 => new Mat3([
    [1, 0, displacement.x],
    [0, 1, displacement.y],
    [0, 0,              1]
]);

/** Calculate the 2D affine axis-aligned scaling matrix (projective representation) for a given scaling vector. */
export const Scaling = (factor: Vec2): Mat3 => new Mat3([
    [factor.x,        0, 0],
    [       0, factor.y, 0],
    [       0,        0, 1]
]);

/** Calculate the 2D affine matrix corresponding to "input vector is coordinates from center c, with vector basis (b1, b2)". */
export const BasisChange = (c: Vec2, b1: Vec2, b2: Vec2): Mat3  => new Mat3([
    [b1.x, b2.x, c.x],
    [b1.y, b2.y, c.y],
    [   0,    0,   1]
]);

// ================ MATRIX INVERSION HELPERS ================ //

/** In-place row swapping. */
const swapRows = (values: number[][], i: number, j: number): void => {
    [values[i], values[j]] = [values[j], values[i]];
};

/** In-place row scaling. */
const scaleRow = (values: number[][], i: number, k: number): void => {
    values[i] = values[i].map(a => k * a);
}

/** In-place row linear combination. */
const combineRows = (values: number[][], from: number, scale: number, into: number): void => {
    values[into] = values[into].map((value, idx) => value + scale * values[from][idx]);
}
