const antonym1on1TokenIds = [
  270,  397,  474,  545,  965, 1106, 1224,
 1275, 1280, 1940, 2598, 2626, 2657, 2670,
 2818, 2928, 3138, 3147, 3288, 3333, 3516,
 3681, 3760, 4297, 4336, 4501, 4509, 4513,
 4864, 5229, 5537, 5769, 6271, 6307, 6448,
 6531, 6554, 7012, 7132, 7165, 7495, 7555,
 7627, 7724, 7764, 8301, 8387, 8397, 8492,
 8683, 8763, 8876
]

const NAME = "MATERIA"
const SYMBOl = "MAT"
const BASE_URI = "https://antonymnft.s3.us-west-1.amazonaws.com/json/"
const START = "TODO: EPOCH TIME"
const END = "TODO: EPOCH TIME"
const SIGNER = "TODO: SIGNER'S ADDRESS" //signer
const ANTONYM = "0x7e3Ef31186D1BEc0D3f35aD701D065743B84C790"


module.exports = [
    NAME, //Token Name
    SYMBOl, //Token Symbol
    BASE_URI, //Token URI
    START, //TODO: starts Friday, October 28, 2022 6:00:00 PM GMT-05:00
    END, //ends Monday, November 28, 2022 6:00:00 PM GMT-05:00
    SIGNER, //TODO: signer
    ANTONYM, //Antonym ERC721 Token
    antonym1on1TokenIds,
  ];