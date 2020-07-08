import { Vec2 } from '@azleur/vec2';
import { Vec3 } from '@azleur/vec3';

import { Mat3, Rotation2D, Translation, Scaling, BasisChange } from '.';

const AssertEqual = (observed: Mat3, expected: Mat3): void => {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const obs = observed.values[i][j];
            const exp = expected.values[i][j];
            const err = Math.abs(obs - exp);
            if (err > 0.0001) {
                throw new Error(`MISMATCH [${i}, ${j}] observed: ${obs}, expected: ${exp}.`);
            }
        }
    }
};

const AssertVec = (observed: Vec3, expected: Vec3): void => {
    for (let i = 0; i < 3; i++) {
        const obs = observed.values[i];
        const exp = expected.values[i];
        const err = Math.abs(obs - exp);
        if (err > 0.0001) {
            throw new Error(`MISMATCH [${i}] observed: ${obs}, expected: ${exp}.\nobserved: ${observed.values}\nexpected: ${expected.values}`);
        }
    }
};

test("Mat3 constructor takes number[][] or (a, b, c, d, e, f, g, h, i) and creates a 3x3 matrix", () => {
    const mat1 = new Mat3([[0, 0, 0], [0, 0, 0], [0, 0, 0]]);
    const mat2 = new Mat3([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
    const mat3 = new Mat3(0, 0, 0, 0, 0, 0, 0, 0, 0);
    const mat4 = new Mat3(1, 2, 3, 4, 5, 6, 7, 8, 9);

    expect(mat1).toEqual({ values: [[0, 0, 0], [0, 0, 0], [0, 0, 0]] });
    expect(mat2).toEqual({ values: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] });
    expect(mat3).toEqual({ values: [[0, 0, 0], [0, 0, 0], [0, 0, 0]] });
    expect(mat4).toEqual({ values: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] });

    expect(mat1).toEqual(mat3);
    expect(mat2).toEqual(mat4);
});

test("Mat3.Transpose() returns a transposed copy", () => {
    const mat1 = Mat3.Zero;
    const mat2 = Mat3.Id;
    const mat3 = new Mat3([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
    const mat4 = new Mat3([[1, 4, 7], [2, 5, 8], [3, 6, 9]]);

    const out1 = mat1.Transpose();
    const out2 = mat2.Transpose();
    const out3 = mat3.Transpose();
    const out4 = mat4.Transpose();

    AssertEqual(out1, mat1); // Zero is transpose-invariant.
    AssertEqual(out2, mat2); // Identity is transpose-invariant.
    AssertEqual(out3, mat4); // mat3 is mapped to mat4.
    AssertEqual(out4, mat3); // mat4 is mapped to mat3 again.
});

test("Mat3.Negate() returns a copy of -this", () => {
    const mat1 = Mat3.Zero;
    const mat2 = Mat3.Id;
    const mat3 = new Mat3([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);

    const mat4 = new Mat3([[-1, 0, 0], [0, -1, 0], [0, 0, -1]]);
    const mat5 = new Mat3([[-1, -2, -3], [-4, -5,  -6], [-7, -8, -9]]);

    const out1 = mat1.Negate();
    const out2 = mat2.Negate();
    const out3 = mat3.Negate();
    const out4 = mat4.Negate();
    const out5 = mat5.Negate();

    AssertEqual(out1, mat1); // Zero is its own negative.
    AssertEqual(out2, mat4);
    AssertEqual(out3, mat5);
    AssertEqual(out4, mat2); // Negate() is its own dual.
    AssertEqual(out5, mat3);
});

test("Mat3.Add(Mat3) adds this + that", () => {
    const mat1 = Mat3.Zero;
    const mat2 = Mat3.Ones;
    const mat3 = Mat3.Id;
    const mat4 = new Mat3([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);

    const mat5 = new Mat3([[2, 1, 1], [1, 2, 1], [1, 1,  2]]);
    const mat6 = new Mat3([[2, 3, 4], [5, 6, 7], [8, 9, 10]]);

    // Adding Zero returns first.
    AssertEqual(mat1.Add(mat1), mat1);
    AssertEqual(mat1.Add(mat2), mat2);
    AssertEqual(mat1.Add(mat3), mat3);
    AssertEqual(mat1.Add(mat4), mat4);

    // Adding to Zero returns second.
    AssertEqual(mat1.Add(mat1), mat1);
    AssertEqual(mat2.Add(mat1), mat2);
    AssertEqual(mat3.Add(mat1), mat3);
    AssertEqual(mat4.Add(mat1), mat4);

    // Non-trivial cases and commutativity:
    AssertEqual(mat2.Add(mat3), mat5);
    AssertEqual(mat3.Add(mat2), mat5);

    AssertEqual(mat2.Add(mat4), mat6);
    AssertEqual(mat4.Add(mat2), mat6);

    // Negating subtracts, inverting the non-trivial cases:
    AssertEqual(mat5.Add(mat2.Negate()), mat3);
    AssertEqual(mat5.Add(mat3.Negate()), mat2);

    AssertEqual(mat6.Add(mat2.Negate()), mat4);
    AssertEqual(mat6.Add(mat4.Negate()), mat2);
});

test("Mat3.Sub(Mat3) subtracts this - that", () => {
    const mat1 = Mat3.Zero;
    const mat2 = Mat3.Ones;
    const mat3 = Mat3.Id;
    const mat4 = new Mat3([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);

    const mat5 = new Mat3([[0, 1, 1], [1, 0, 1], [1, 1, 0]]);
    const mat6 = new Mat3([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);

    // Subtracting from Zero returns negative.
    AssertEqual(mat1.Sub(mat1), mat1.Negate());
    AssertEqual(mat1.Sub(mat2), mat2.Negate());
    AssertEqual(mat1.Sub(mat3), mat3.Negate());
    AssertEqual(mat1.Sub(mat4), mat4.Negate());

    // Subtracting Zero returns same.
    AssertEqual(mat1.Sub(mat1), mat1);
    AssertEqual(mat2.Sub(mat1), mat2);
    AssertEqual(mat3.Sub(mat1), mat3);
    AssertEqual(mat4.Sub(mat1), mat4);

    // Non-trivial cases and anti-commutativity:
    AssertEqual(mat2.Sub(mat3), mat5);
    AssertEqual(mat3.Sub(mat2), mat5.Negate());

    AssertEqual(mat4.Sub(mat2), mat6);
    AssertEqual(mat2.Sub(mat4), mat6.Negate());
});

test("Mat3.TimesNum(number) returns the scalar product this * that", () => {
    const mat = new Mat3([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);

    // 1 is the neutral element.
    AssertEqual(Mat3.Zero.TimesNum(1), Mat3.Zero);
    AssertEqual(Mat3.Ones.TimesNum(1), Mat3.Ones);
    AssertEqual(Mat3.Id  .TimesNum(1), Mat3.Id  );
    AssertEqual(mat      .TimesNum(1), mat      );

    // 0 maps everything to Mat3.Zero.
    AssertEqual(Mat3.Zero.TimesNum(0), Mat3.Zero);
    AssertEqual(Mat3.Ones.TimesNum(0), Mat3.Zero);
    AssertEqual(Mat3.Id  .TimesNum(0), Mat3.Zero);

    // 2 duplicates!
    AssertEqual(Mat3.Zero.TimesNum(2), Mat3.Zero);
    AssertEqual(Mat3.Ones.TimesNum(2), new Mat3([[2, 2, 2], [2,  2,  2], [ 2,  2,  2]]));
    AssertEqual(Mat3.Id  .TimesNum(2), new Mat3([[2, 0, 0], [0,  2,  0], [ 0,  0,  2]]));
    AssertEqual(mat      .TimesNum(2), new Mat3([[2, 4, 6], [8, 10, 12], [14, 16, 18]]));
});

test("Mat3.TimesMat(Mat3) returns a copy of the matrix product this * that", () => {
    const mat = new Mat3([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);

    // Mat3.Id is the left identity.
    AssertEqual(Mat3.Id.TimesMat(Mat3.Zero), Mat3.Zero);
    AssertEqual(Mat3.Id.TimesMat(Mat3.Ones), Mat3.Ones);
    AssertEqual(Mat3.Id.TimesMat(Mat3.Id  ), Mat3.Id  );
    AssertEqual(Mat3.Id.TimesMat(mat      ), mat      );

    // Mat3.Id is the right identity.
    AssertEqual(Mat3.Zero.TimesMat(Mat3.Id), Mat3.Zero);
    AssertEqual(Mat3.Ones.TimesMat(Mat3.Id), Mat3.Ones);
    AssertEqual(Mat3.Id  .TimesMat(Mat3.Id), Mat3.Id  );
    AssertEqual(mat      .TimesMat(Mat3.Id), mat      );

    // Mat3.Zero is the left zero.
    AssertEqual(Mat3.Zero.TimesMat(Mat3.Zero), Mat3.Zero);
    AssertEqual(Mat3.Zero.TimesMat(Mat3.Ones), Mat3.Zero);
    AssertEqual(Mat3.Zero.TimesMat(Mat3.Id  ), Mat3.Zero);
    AssertEqual(Mat3.Zero.TimesMat(mat      ), Mat3.Zero);

    // Mat3.Zero is the right zero.
    AssertEqual(Mat3.Zero.TimesMat(Mat3.Zero), Mat3.Zero);
    AssertEqual(Mat3.Ones.TimesMat(Mat3.Zero), Mat3.Zero);
    AssertEqual(Mat3.Id  .TimesMat(Mat3.Zero), Mat3.Zero);
    AssertEqual(mat      .TimesMat(Mat3.Zero), Mat3.Zero);

    // Real stuff
    AssertEqual(Mat3.Ones.TimesMat(Mat3.Ones), new Mat3([[ 3,  3,  3], [ 3,  3,  3], [  3,   3,   3]]));
    AssertEqual(Mat3.Ones.TimesMat(mat      ), new Mat3([[12, 15, 18], [12, 15, 18], [ 12,  15,  18]]));
    AssertEqual(mat      .TimesMat(Mat3.Ones), new Mat3([[ 6,  6,  6], [15, 15, 15], [ 24,  24,  24]]));
    AssertEqual(mat      .TimesMat(mat      ), new Mat3([[30, 36, 42], [66, 81, 96], [102, 126, 150]]));
});

test("Mat3.TimesVec(Vec3) returns a copy of the matrix * vector product this * that", () => {
    const mat = new Mat3([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
    const vec = new Vec3(1, 2, 3);

    // Mat3.Id is the left identity.
    AssertVec(Mat3.Id.TimesVec(Vec3.Zero), Vec3.Zero);
    AssertVec(Mat3.Id.TimesVec(Vec3.One ), Vec3.One );
    AssertVec(Mat3.Id.TimesVec(Vec3.X   ), Vec3.X   );
    AssertVec(Mat3.Id.TimesVec(Vec3.Y   ), Vec3.Y   );
    AssertVec(Mat3.Id.TimesVec(vec      ), vec      );

    // Mat3.Zero is the left zero.
    AssertVec(Mat3.Zero.TimesVec(Vec3.Zero), Vec3.Zero);
    AssertVec(Mat3.Zero.TimesVec(Vec3.One ), Vec3.Zero);
    AssertVec(Mat3.Zero.TimesVec(Vec3.X   ), Vec3.Zero);
    AssertVec(Mat3.Zero.TimesVec(Vec3.Y   ), Vec3.Zero);
    AssertVec(Mat3.Zero.TimesVec(vec      ), Vec3.Zero);

    // Vec3.Zero is the right zero.
    AssertVec(Mat3.Zero.TimesVec(Vec3.Zero), Vec3.Zero);
    AssertVec(Mat3.Ones.TimesVec(Vec3.Zero), Vec3.Zero);
    AssertVec(Mat3.Id  .TimesVec(Vec3.Zero), Vec3.Zero);
    AssertVec(mat      .TimesVec(Vec3.Zero), Vec3.Zero);

    // Real stuff.
    AssertVec(Mat3.Ones.TimesVec(Vec3.One), new Vec3( 3,  3,  3));
    AssertVec(Mat3.Ones.TimesVec(vec     ), new Vec3( 6,  6,  6));
    AssertVec(mat      .TimesVec(Vec3.One), new Vec3( 6, 15, 24));
    AssertVec(mat      .TimesVec(vec     ), new Vec3(14, 32, 50));
});

test("Mat3.Trace() returns the sum of the diagonal", () => {
    const mat1 = new Mat3([[1, 2, 3], [4, 5, 6], [7, 8,  9]]);
    const mat2 = new Mat3([[1, 0, 0], [0, 1, 0], [0, 0, -2]]);

    expect(Mat3.Zero.Trace()).toBeCloseTo( 0);
    expect(Mat3.Ones.Trace()).toBeCloseTo( 3);
    expect(Mat3.Id  .Trace()).toBeCloseTo( 3);
    expect(mat1     .Trace()).toBeCloseTo(15);
    expect(mat2     .Trace()).toBeCloseTo( 0);
});

test("Mat3.Determinant() returns the determinant", () => {
    const mat1 = new Mat3([[1, 2, 3], [4, 5, 6], [7, 8,  9]]);
    const mat2 = new Mat3([[1, 0, 0], [0, 1, 0], [0, 0, -2]]);
    const mat3 = new Mat3([[6, 6, 0], [0, 2,  3], [6, 0, 4]]);

    expect(Mat3.Zero.Determinant()).toBeCloseTo(  0);
    expect(Mat3.Ones.Determinant()).toBeCloseTo(  0);
    expect(Mat3.Id  .Determinant()).toBeCloseTo(  1);
    expect(mat1     .Determinant()).toBeCloseTo(  0);
    expect(mat2     .Determinant()).toBeCloseTo( -2);
    expect(mat3     .Determinant()).toBeCloseTo(156);
});

test("Rotation2D(number) returns the (ccw) rotation matrix for an angle, in radians", () => {
    const Pi = Math.PI;

    const r0   = Rotation2D(0.0 * Pi);
    const r90  = Rotation2D(0.5 * Pi);
    const r180 = Rotation2D(1.0 * Pi);
    const r270 = Rotation2D(1.5 * Pi);
    const r30  = Rotation2D(Pi / 6);

    const RightPos = new Vec3(+1,  0, 1);
    const LeftPos  = new Vec3(-1,  0, 1);
    const UpPos    = new Vec3( 0, +1, 1);
    const DownPos  = new Vec3( 0, -1, 1);

    const RightVec = new Vec3(+1,  0, 0);
    const LeftVec  = new Vec3(-1,  0, 0);
    const UpVec    = new Vec3( 0, +1, 0);
    const DownVec  = new Vec3( 0, -1, 0);

    AssertVec(r0.TimesVec(RightPos), RightPos);
    AssertVec(r0.TimesVec(UpPos   ), UpPos   );

    AssertVec(r90.TimesVec(RightPos), UpPos  );
    AssertVec(r90.TimesVec(UpPos   ), LeftPos);

    AssertVec(r180.TimesVec(RightPos), LeftPos);
    AssertVec(r180.TimesVec(UpPos   ), DownPos);

    AssertVec(r270.TimesVec(RightPos), DownPos );
    AssertVec(r270.TimesVec(UpPos   ), RightPos);

    AssertVec(r30.TimesVec(RightPos), new Vec3(Math.sqrt(3) / 2,            1 / 2, 1));
    AssertVec(r30.TimesVec(UpPos   ), new Vec3(         - 1 / 2, Math.sqrt(3) / 2, 1));

    AssertVec(r0.TimesVec(RightVec), RightVec);
    AssertVec(r0.TimesVec(UpVec   ), UpVec   );

    AssertVec(r90.TimesVec(RightVec), UpVec  );
    AssertVec(r90.TimesVec(UpVec   ), LeftVec);

    AssertVec(r180.TimesVec(RightVec), LeftVec);
    AssertVec(r180.TimesVec(UpVec   ), DownVec);

    AssertVec(r270.TimesVec(RightVec), DownVec );
    AssertVec(r270.TimesVec(UpVec   ), RightVec);

    AssertVec(r30.TimesVec(RightVec), new Vec3(Math.sqrt(3) / 2,            1 / 2, 0));
    AssertVec(r30.TimesVec(UpVec   ), new Vec3(         - 1 / 2, Math.sqrt(3) / 2, 0));
});

// test("TEMPORARY sanity check for inversion helpers", () => {
//     const Values = () => [[1, 2, 3], [4, 5, 6], [7, 8, 9]];

//     const val1 = Values();
//     swapRows(val1, 0, 1);
//     expect(val1).toEqual([[4, 5, 6], [1, 2, 3], [7, 8, 9]]);

//     const val2 = Values();
//     scaleRow(val2, 2, 3);
//     expect(val2).toEqual([[1, 2, 3], [4, 5, 6], [21, 24, 27]]);

//     const val3 = Values();
//     combineRows(val3, 0, 2, 1);
//     expect(val3).toEqual([[1, 2, 3], [6, 9, 12], [7, 8, 9]]);
// });

test("Mat3.Clone() creates a deep copy of this", () => {
    const mat1 = new Mat3([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
    const mat2 = mat1.Clone();
    mat1.values[0][1] = 10;
    mat2.values[1][2] = 11;

    expect(mat1).toEqual(new Mat3([[1, 10, 3], [4, 5,  6], [7, 8, 9]]));
    expect(mat2).toEqual(new Mat3([[1,  2, 3], [4, 5, 11], [7, 8, 9]]));
});

test("Mat3.Invert() calculates the inverse matrix, without modifying the original", () => {
    const mat1 = new Mat3([
        [8, 2, 3],
        [6, 8, 5],
        [3, 9, 9]
    ]);
    const mat2 = new Mat3([
        [ 0.118421,  0.039474, -0.061404],
        [-0.171053,  0.276316, -0.096491],
        [ 0.131579, -0.289474,  0.228070]
    ]);

    AssertEqual(Mat3.Id.Invert(), Mat3.Id);

    AssertEqual(mat1.Invert(), mat2);
    AssertEqual(mat2.Invert(), mat1);

    AssertEqual(mat1.TimesMat(mat2), Mat3.Id);
    AssertEqual(mat2.TimesMat(mat1), Mat3.Id);
});

test("Translation(displacement) returns the 2D affine matrix for a translation with the given displacement", () => {
    const mat1 = Translation(Vec2.Zero);
    const mat2 = Translation(Vec2.X);
    const mat3 = Translation(Vec2.Y);
    const mat4 = Translation(new Vec2(-2, 4));

    AssertEqual(mat1, Mat3.Id); // Translation by zero does nothing.

    // mat2 moves points by (+1, 0).
    AssertVec(mat2.TimesVec(new Vec3(0,  0, 1)), new Vec3(1,  0, 1));
    AssertVec(mat2.TimesVec(new Vec3(1,  0, 1)), new Vec3(2,  0, 1));
    AssertVec(mat2.TimesVec(new Vec3(0,  1, 1)), new Vec3(1,  1, 1));
    AssertVec(mat2.TimesVec(new Vec3(3, -6, 1)), new Vec3(4, -6, 1));

    // mat2 does not move vectors.
    AssertVec(mat2.TimesVec(new Vec3(0,  0, 0)), new Vec3(0,  0, 0));
    AssertVec(mat2.TimesVec(new Vec3(1,  0, 0)), new Vec3(1,  0, 0));
    AssertVec(mat2.TimesVec(new Vec3(0,  1, 0)), new Vec3(0,  1, 0));
    AssertVec(mat2.TimesVec(new Vec3(3, -6, 0)), new Vec3(3, -6, 0));

    // mat3 moves points by (0, +1).
    AssertVec(mat3.TimesVec(new Vec3(0,  0, 1)), new Vec3(0,  1, 1));
    AssertVec(mat3.TimesVec(new Vec3(1,  0, 1)), new Vec3(1,  1, 1));
    AssertVec(mat3.TimesVec(new Vec3(0,  1, 1)), new Vec3(0,  2, 1));
    AssertVec(mat3.TimesVec(new Vec3(3, -6, 1)), new Vec3(3, -5, 1));

    // mat3 does not move vectors.
    AssertVec(mat3.TimesVec(new Vec3(0,  0, 0)), new Vec3(0,  0, 0));
    AssertVec(mat3.TimesVec(new Vec3(1,  0, 0)), new Vec3(1,  0, 0));
    AssertVec(mat3.TimesVec(new Vec3(0,  1, 0)), new Vec3(0,  1, 0));
    AssertVec(mat3.TimesVec(new Vec3(3, -6, 0)), new Vec3(3, -6, 0));

    // mat4 moves points by (-2, +4).
    AssertVec(mat4.TimesVec(new Vec3(0,  0, 1)), new Vec3(-2,  4, 1));
    AssertVec(mat4.TimesVec(new Vec3(1,  0, 1)), new Vec3(-1,  4, 1));
    AssertVec(mat4.TimesVec(new Vec3(0,  1, 1)), new Vec3(-2,  5, 1));
    AssertVec(mat4.TimesVec(new Vec3(3, -6, 1)), new Vec3( 1, -2, 1));

    // mat4 does not move vectors.
    AssertVec(mat4.TimesVec(new Vec3(0,  0, 0)), new Vec3(0,  0, 0));
    AssertVec(mat4.TimesVec(new Vec3(1,  0, 0)), new Vec3(1,  0, 0));
    AssertVec(mat4.TimesVec(new Vec3(0,  1, 0)), new Vec3(0,  1, 0));
    AssertVec(mat4.TimesVec(new Vec3(3, -6, 0)), new Vec3(3, -6, 0));
});

test("Scaling(factor) returns the 2D affine matrix for axis-aligned scaling", () => {
    const mat1 = Scaling(Vec2.One);
    const mat2 = Scaling(Vec2.Zero);
    const mat3 = Scaling(new Vec2(2, -3));

    // Scaling by (1, 1) keeps points stable.
    AssertVec(mat1.TimesVec(new Vec3(0,  0, 1)), new Vec3(0,  0, 1));
    AssertVec(mat1.TimesVec(new Vec3(1,  0, 1)), new Vec3(1,  0, 1));
    AssertVec(mat1.TimesVec(new Vec3(0,  1, 1)), new Vec3(0,  1, 1));
    AssertVec(mat1.TimesVec(new Vec3(3, -6, 1)), new Vec3(3, -6, 1));

    // Scaling by (1, 1) keeps vectors stable.
    AssertVec(mat1.TimesVec(new Vec3(0,  0, 0)), new Vec3(0,  0, 0));
    AssertVec(mat1.TimesVec(new Vec3(1,  0, 0)), new Vec3(1,  0, 0));
    AssertVec(mat1.TimesVec(new Vec3(0,  1, 0)), new Vec3(0,  1, 0));
    AssertVec(mat1.TimesVec(new Vec3(3, -6, 0)), new Vec3(3, -6, 0));

    // Scaling by (0, 0) sends points to the zero point.
    AssertVec(mat2.TimesVec(new Vec3(0,  0, 1)), new Vec3(0, 0, 1));
    AssertVec(mat2.TimesVec(new Vec3(1,  0, 1)), new Vec3(0, 0, 1));
    AssertVec(mat2.TimesVec(new Vec3(0,  1, 1)), new Vec3(0, 0, 1));
    AssertVec(mat2.TimesVec(new Vec3(3, -6, 1)), new Vec3(0, 0, 1));

    // Scaling by (0, 0) sends vectors to the zero vector.
    AssertVec(mat2.TimesVec(new Vec3(0,  0, 0)), new Vec3(0, 0, 0));
    AssertVec(mat2.TimesVec(new Vec3(1,  0, 0)), new Vec3(0, 0, 0));
    AssertVec(mat2.TimesVec(new Vec3(0,  1, 0)), new Vec3(0, 0, 0));
    AssertVec(mat2.TimesVec(new Vec3(3, -6, 0)), new Vec3(0, 0, 0));

    // Scaling by (2, -3) sends points to their expanded position.
    AssertVec(mat3.TimesVec(new Vec3(0,  0, 1)), new Vec3(0,  0, 1));
    AssertVec(mat3.TimesVec(new Vec3(1,  0, 1)), new Vec3(2,  0, 1));
    AssertVec(mat3.TimesVec(new Vec3(0,  1, 1)), new Vec3(0, -3, 1));
    AssertVec(mat3.TimesVec(new Vec3(3, -6, 1)), new Vec3(6, 18, 1));

    // Scaling by (1, 1) sends vectors to their expanded version.
    AssertVec(mat3.TimesVec(new Vec3(0,  0, 0)), new Vec3(0,  0, 0));
    AssertVec(mat3.TimesVec(new Vec3(1,  0, 0)), new Vec3(2,  0, 0));
    AssertVec(mat3.TimesVec(new Vec3(0,  1, 0)), new Vec3(0, -3, 0));
    AssertVec(mat3.TimesVec(new Vec3(3, -6, 0)), new Vec3(6, 18, 0));
})

test("BasisChange(c, b1, b2) returns the 2D affine matrix for converting coordinates from center c and basis (b1, b2) to Cartesian", () => {
    const mat1 = BasisChange(Vec2.Zero, Vec2.X, Vec2.Y);
    const mat2 = BasisChange(new Vec2(-2, 3), new Vec2(1, 1), new Vec2(2, -1));

    AssertEqual(mat1, Mat3.Id); // Translation by zero does nothing.

    // mat2 moves points by (+1, 0).
    AssertVec(mat2.TimesVec(new Vec3(0,  0, 1)), new Vec3( -2,  3, 1));
    AssertVec(mat2.TimesVec(new Vec3(1,  0, 1)), new Vec3( -1,  4, 1));
    AssertVec(mat2.TimesVec(new Vec3(0,  1, 1)), new Vec3(  0,  2, 1));
    AssertVec(mat2.TimesVec(new Vec3(3, -6, 1)), new Vec3(-11, 12, 1));

    // mat2 does not move vectors.
    AssertVec(mat2.TimesVec(new Vec3(0,  0, 0)), new Vec3( 0,  0, 0));
    AssertVec(mat2.TimesVec(new Vec3(1,  0, 0)), new Vec3( 1,  1, 0));
    AssertVec(mat2.TimesVec(new Vec3(0,  1, 0)), new Vec3( 2, -1, 0));
    AssertVec(mat2.TimesVec(new Vec3(3, -6, 0)), new Vec3(-9,  9, 0));
});
