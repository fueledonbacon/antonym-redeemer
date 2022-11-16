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

const SIGNER = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" //signer
const ANTONYM = "0x1f31CAB258e28e32BFc8F4666a12f686dfD95b25"


module.exports = [
    "MATERIA", //Token Name
    "MAT", //Token Symbol
    "https://antonymnft.s3.us-west-1.amazonaws.com/json/", //Token URI
    1669932000, //ends Thursday, December 1, 2022 5:00:00 PM GMT-05:00
    SIGNER, //TODO: signer
    ANTONYM, //Antonym ERC721 Token
    antonym1on1TokenIds,
  ];