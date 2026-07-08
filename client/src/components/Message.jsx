function Message({ sender, text }) {

    return (

        <div className={`message ${sender}`}>

            <div className="bubble">

                <div className="sender">

                    {sender === "user"
                        ? "👤 You"
                        : "🤖 Receptionist"}

                </div>

                {text}

            </div>

        </div>

    );

}

export default Message;