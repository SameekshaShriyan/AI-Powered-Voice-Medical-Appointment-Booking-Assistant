function Message({ sender, text }) {

    return (

        <div className={sender === "user" ? "user" : "ai"}>

            <strong>
                {sender === "user" ? "You" : "AI"}
            </strong>

            <p>{text}</p>

        </div>

    );

}

export default Message;