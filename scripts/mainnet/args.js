const antonym1on1TokenIds = [
  269,  396,  473,  544,  964, 1105, 1223,
 1274, 1279, 1939, 2597, 2625, 2656, 2669,
 2817, 2927, 3137, 3146, 3287, 3332, 3515,
 3680, 3759, 4296, 4335, 4500, 4508, 4512,
 4863, 5228, 5536, 5768, 6270, 6306, 6447,
 6530, 6553, 7011, 7131, 7164, 7494, 7554,
 7626, 7723, 7763, 8300, 8386, 8396, 8491,
 8682, 8762, 8875
]

const NAME = "Materia"
const SYMBOl = "MAT"
const BASE_URI = "https://antonymnft.s3.us-west-1.amazonaws.com/json/"
const END = 1673802000
const SIGNER = "0x47C859fA99F9443a8B30b09891B073bc15967Af1" //signer
const ANTONYM = "0x7e3Ef31186D1BEc0D3f35aD701D065743B84C790"


module.exports = [
    NAME, //Token Name
    SYMBOl, //Token Symbol
    BASE_URI, //Token URI
    END, //ends Sunday, January 15, 2023 12:00:00 PM GMT-05:00
    SIGNER, 
    ANTONYM, //Antonym ERC721 Token
    antonym1on1TokenIds,
  ];