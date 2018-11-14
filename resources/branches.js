import { h, render, Component } from 'preact'
import Portal from './Portal'
import pluginCall from 'sketch-module-web-view/client'

function cleanBranchName (name) {
  return name.replace('(B[m', '')
}

class Branch extends Component {
  render ({name, selected}) {
    return (
      <div className={'branch' + (selected ? ' selected' : '')}>
        <span className='name' onClick={() => pluginCall('checkoutBranch', name)} title='Switch to the branch'>
          {name}
        </span>
        <span className='delete' onClick={() => pluginCall('deleteBranch', name)}>
          <img src='delete.svg' title='Delete the branch' />
        </span>
      </div>
    )
  }
}

class Branches extends Component {
  constructor () {
    super()
    this.state = {
      branches: (window.branches || []).map(cleanBranchName),
      currentBranch: cleanBranchName(window.currentBranch),
      ready: window.ready
    }
    if (!window.ready) {
      const interval = setInterval(() => {
        if (window.ready) {
          this.setState({
            branches: (window.branches || []).map(cleanBranchName),
            currentBranch: cleanBranchName(window.currentBranch),
            ready: window.ready
          })
          clearInterval(interval)
        }
      }, 100)
    }
  }

  render (props, {ready, branches, currentBranch}) {
    return (
      <div>
        <Portal>
          <button onClick={() => pluginCall('createBranch')} className='create'>
            Create a new branch
          </button>
        </Portal>
        {!ready && 'loading...'}
        {(branches || []).map((name) =>
          <Branch key={name}
            name={name}
            selected={name === currentBranch} />
        )}
      </div>
    )
  }
}


// export default class TodoList extends Component {
//   state = { todos: [], text: '' };
//   setText = e => {
//       this.setState({ text: e.target.value });
//   };
//   addTodo = () => {
//       let { todos, text } = this.state;
//       todos = todos.concat({ text });
//       this.setState({ todos, text: '' });
//   };
//   render({ }, { todos, text }) {
//       return (
//           <form onSubmit={this.addTodo} action="javascript:">
//               <input value={text} onInput={this.setText} />
//               <button type="submit">Add</button>
//               <ul>
//                   { todos.map( todo => (
//                       <li>{todo.text}</li>
//                   )) }
//               </ul>
//           </form>
//       );
//   }
// }
// render(<TodoList />, document.body);
render(<Branches />, document.getElementById('container'))


