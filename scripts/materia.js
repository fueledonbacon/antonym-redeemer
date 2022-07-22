require('dotenv').config({path:__dirname+'/.env'});


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

const antonym1on1TokenIdsMock = [
  1,      5,   10,   15,   20,   25,   30,
 1275, 1280, 1940, 2598, 2626, 2657, 2670,
 2818, 2928, 3138, 3147, 3288, 3333, 3516,
 3681, 3760, 4297, 4336, 4501, 4509, 4513,
 4864, 5229, 5537, 5769, 6271, 6307, 6448,
 6531, 6554, 7012, 7132, 7165, 7495, 7555,
 7627, 7724, 7764, 8301, 8387, 8397, 8492,
 8683, 8763, 8876
]


const {
    SIGNER,
    ANTONYM
  } = process.env

module.exports = [
    "MATERIA", //Token Name
    "MAT", //Token Symbol
    "https://antonymnft.s3.us-west-1.amazonaws.com/json/", //Token URI
    1658432768, //starts in Thursday, July 21, 2022 10:00:00 PM GMT-05:00
    1658529968 ,//ends in Thursday, July 21, 2022 7:18:00 PM GMT-05:00
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", //signer
    "0xA0B69178DDc67E8870C39Ea8589b2A8dBf28CBD2",
    antonym1on1TokenIdsMock
  ];