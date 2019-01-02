import React from 'react';
import List from './List';
import { PropTypes } from 'prop-types';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';


class KanbanBoard extends React.Component{

     render(){
        
          return (
              <div className="app">
                   <List id='todo' title="To Do" 
                         taskCallbacks={this.props.taskCallbacks} 
                         cardCallBacks={this.props.cardCallBacks}
                         cards={this.props.cards.filter( card => card.status === 'todo')}/> 

                   <List id='in-progress' title="In Progress" 
                         taskCallbacks={this.props.taskCallbacks}
                         cardCallBacks={this.props.cardCallBacks} 
                         cards={this.props.cards.filter( card => card.status === 'in-progress')}/> 

                   <List id='done' title="Done" 
                         taskCallbacks={this.props.taskCallbacks}
                         cardCallBacks={this.props.cardCallBacks} 
                         cards={this.props.cards.filter( card => card.status === 'done')}/>       
              </div>
          );
     }
}


KanbanBoard.propTypes = {
     cards: PropTypes.arrayOf(PropTypes.object),
     taskCallbacks: PropTypes.object,
     cardCallBacks: PropTypes.object
};


export default DragDropContext(HTML5Backend)(KanbanBoard);