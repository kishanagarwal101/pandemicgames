const roomModel = require('../Models/roomModel');
const shazamModel = require('../Models/shazamModel');
const ticTacToeModel = require('../Models/tictactoeModel');

const roomExist = async (roomID) => {
    const response = await roomModel.findOne({ roomID });
    const shazamResponse = await shazamModel.findOne({ roomID });
    const TTTResponse = await ticTacToeModel.findOne({ roomID });

    if (response || shazamResponse || TTTResponse) {
        return true;
    }
    else return false;
}
module.exports = roomExist;