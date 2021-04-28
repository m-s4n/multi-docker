import {Route, Switch } from 'react-router-dom';
import Fib from './Fib';
import OtherPage from './OtherPage';

function App() {
  return (
   <Switch>
     <Route path="/" exact>
        <Fib/>
     </Route>
     <Route path="/otherpage" exact>
        <OtherPage />
     </Route>
   </Switch>
  );
}

export default App;
