import './profile.css';

export default function Profile() {
    return (
      <div className="row">
        <div className="left"> 
          <img src="https://pbs.twimg.com/media/GLhxXtfXQAA0YbG?format=jpg&name=medium" alt="profile picture"></img>
          
          <div className="profileSection">
            <p>Name: Super Cool Team Leader Gabby</p>
            <br></br>
            <p>Password: **************</p>
          </div>
        </div>
        <div className="right">
          <h1>Budgeting Goals</h1>
        </div>
      </div>
    );
  }
  