def does_point_belong_to_sepc265k1_curve(x, y):
    # Refer: http://koclab.cs.ucsb.edu/teaching/ecc/project/2015Projects/Bjoernsen.pdf
    # Also refer ChatGPT :p

    # Formula:
    # (y^2) % p == (x^3 + a*x + b) % p
    p = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F
    a = 0
    b = 7

    # return pow(y, 2, p) == (pow(x, 3, p) + ((a * x) % p) + b) % p
    # well a is 0 so I'm simplifying it

    left = pow(y, 2, p)
    right = (pow(x, 3, p) + b) % p

    return left == right


# test cases from ChatGPT
# need to recheck this
def test_does_point_belong_to_sepc265k1_curve():
    # Test valid points on the curve
    assert does_point_belong_to_sepc265k1_curve(55066263022277343669578718895168534326250603453777594175500187360389116729240, 32670510020758816978083085130507043184471273380659243275938904335757337482424)
    assert does_point_belong_to_sepc265k1_curve(89565891926547004231252920425935692360644145829622209833684329913297188986597, 12158399299693830322967808612713398636155367887041628176798871954788371653930)

    # Test invalid points not on the curve
    assert not does_point_belong_to_sepc265k1_curve(1, 2)
    assert not does_point_belong_to_sepc265k1_curve(0, 0)
    assert not does_point_belong_to_sepc265k1_curve(100, 200)
    assert not does_point_belong_to_sepc265k1_curve(78371274939450204848871079873179119804654684011883701083120242298544747793763, 12345678901234567890123456789012345678901234567890123456789012345678901234)

test_does_point_belong_to_sepc265k1_curve()
