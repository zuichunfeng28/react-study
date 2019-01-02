import React from 'react';
import Card from './Card';
import { PropTypes } from 'prop-types';
import { DropTarget } from 'react-dnd';
import constants from './constants';

const listTargetSpec = {
    hover(props, monitor){
        const draggedId = monitor.getItem().id;
        props.cardCallBacks.updateCardStatus(draggedId,props.id)
    }
};


function collect(connect,monitor){
    return {
        connectDropTarget: connect.dropTarget()
    };
}

 class List extends React.Component{
     
    render(){
        const { connectDropTarget } = this.props;
        let cards = this.props.cards.map( card => {
               return <Card key={card.id} 
                            taskCallbacks={this.props.taskCallbacks}
                            cardCallBacks={this.props.cardCallBacks}
                            {...card}/>
        });

        return connectDropTarget(
            <div className="list">
                 <h1>{this.props.title}</h1>
                 {cards}
            </div>
        );
    }
};



List.propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    cards: PropTypes.arrayOf(PropTypes.object),
    taskCallbacks: PropTypes.object,
    cardCallBacks: PropTypes.object,
    connectDropTarget: PropTypes.func.isRequired
}


export default DropTarget(constants.CARD,listTargetSpec,collect)(List);