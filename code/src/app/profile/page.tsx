import './profile.css';

export default function Profile() {
    return (
      <div className="row">
        <div className="column left"> 
          {/* <img src="https://pbs.twimg.com/media/GLhxXtfXQAA0YbG?format=jpg&name=medium" alt="profile picture"></img> */}
          
          <h1>Profile</h1>
          <div className="profileSection">
            <p>Name: Super Cool Team Leader Gabby</p>
            <br></br>
            <p>Password: **************</p>
          </div>
        </div>
        <div className="column right">
          <h1>Budgeting Goals</h1>
          <div className="profileSection">
            <h2>Savings</h2>
            <p>Aiming to save $2 every month</p>
            <h2>Expenses</h2>
            <p>Maximum of $1000 spent every day on for funsies</p>
            <p>Maximum of $50 spent every week on groceries</p>
          </div>
        </div>
      </div>
    );
  }