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