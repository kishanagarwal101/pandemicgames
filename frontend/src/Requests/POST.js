const POST = async (path, body) => {
    try {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify(body);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        const response = await fetch(path, requestOptions);
        const parsedJSON = await response.json();
        return parsedJSON;

    }
    catch (err) {
        console.error("Error:", err);
    }
}

export default POST;