import random
from dataclasses import dataclass
from sha3 import keccak_256


@dataclass
class Point:
    x: float
    y: float


P = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F
N = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141
G = Point(
    x=55066263022277343669578718895168534326250603453777594175500187360389116729240,
    y=32670510020758816978083085130507043184471273380659243275938904335757337482424,
)

SECRET_NONCE = random.getrandbits(256) % N

ADD_TWO_POINTS_CACHE = {}


def add_two_points(p1: Point, p2: Point) -> Point:
    key = f"{p1.x} {p1.y} {p2.x} {p2.y}"

    cached_point = ADD_TWO_POINTS_CACHE.get(key)
    if cached_point:
        return cached_point

    slope = (p1.y - p2.y) * pow(p1.x - p2.x, -1, P)

    new_x = (pow(slope, 2, P) - (p1.x + p2.x)) % P
    new_y = ((slope * (p1.x - new_x)) - p1.y) % P

    new_point = Point(x=new_x, y=new_y)

    ADD_TWO_POINTS_CACHE[key] = new_point

    return new_point


ADD_SAME_POINTS_CACHE = {}


def add_same_point(p: Point) -> Point:
    key = f"{p.x} {p.y}"

    cached_point = ADD_SAME_POINTS_CACHE.get(key)
    if cached_point:
        return cached_point

    slope = (
        # a=0 for sepc265k1 so simplifying
        # ((3 * pow(p.x, 2, P) + a)
        (3 * pow(p.x, 2, P))
        * pow(2 * p.y, -1, P)
    ) % P

    new_x = (pow(slope, 2, P) - (2 * p.x)) % P
    new_y = ((slope * (p.x - new_x)) - p.y) % P

    new_point = Point(x=new_x, y=new_y)

    ADD_SAME_POINTS_CACHE[key] = new_point

    return new_point


def scalar_multiply(point: Point, scalar: int) -> Point:
    new_point = point

    # Convert the scalar to binary and iterate over its bits
    scalar_binary = bin(scalar)[2:]
    for i in range(1, len(scalar_binary)):
        # Double the result
        new_point = add_same_point(new_point)

        # If the current bit is 1, add the original point
        if scalar_binary[i] == "1":
            new_point = add_two_points(new_point, point)

    return new_point


def get_address(public_key_point: Point) -> str:
    concat_x_y = public_key_point.x.to_bytes(
        32, byteorder="big"
    ) + public_key_point.y.to_bytes(32, byteorder="big")
    eth_addr = "0x" + keccak_256(concat_x_y).digest()[-20:].hex()
    return eth_addr


PUBLIC_KEY_POINT_CACHE = {}


def generate_address_with_6_leading_zeroes():
    # Generate a random secret nonce (ephemeral key)
    secret_nonce = random.getrandbits(256) % N

    for private_key_base in range(N):
        private_key = (private_key_base + secret_nonce) % N

        # we are iterating the private key so this trick will work :p
        prev_private_key = private_key - 1
        prev_public_key_point = PUBLIC_KEY_POINT_CACHE.get(prev_private_key)

        if prev_public_key_point:
            public_key_point = add_two_points(prev_public_key_point, G)
        else:
            public_key_point = scalar_multiply(G, private_key)

        PUBLIC_KEY_POINT_CACHE[private_key] = public_key_point

        address = get_address(public_key_point)

        if private_key_base % 100_000 == 0:
            print(private_key_base)

        if address.startswith("0x000000"):
            print("FOUND:")
            print(f"secret_nonce: {secret_nonce}")
            print(f"private_key_base: {private_key_base}")
            print(f"private_key: {private_key}")
            print(f"public_key_point: {public_key_point}")
            print(f"address: {address}")
            break


if __name__ == "__main__":
    generate_address_with_6_leading_zeroes()
