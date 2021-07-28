const ticTacToeModel = require("../../../Models/tictactoeModel");

const disconnectTTT = async (username, roomID) => {
    const room = await ticTacToeModel.findOne({ roomID })
    if (room) {
        if (room.adminUsername === username) {
            //Amin Leaves
        }
        else {
            //User Leaves
        }
    }





    console.log(`${username} left the lobby!`)

}
module.exports = disconnectTTT;