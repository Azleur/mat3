import { Vec3 } from '@azleur/vec3';

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
        const values: number[] = [0, 0];
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
}

/**
 * Calculate the 2D affine rotation matrix (projective representation) for a given angle, in radians.
 *
 * @param theta Angle, in radians.
 * @returns Rotation matrix.
 */
export const AffineRotationMatrix = (theta: number): Mat3 => {
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    return new Mat3([[c, -s, 0], [s, c, 0], [0, 0, 1]]);
};
