import React from 'react';
import CheckList from './CheckList';
import { PropTypes } from 'prop-types';
import marked from 'marked';
import ReatcCSSTransitionGroup from 'react-addons-css-transition-group';
import constants from './constants';
import { DragSource, DropTarget } from 'react-dnd';

let titlePropType = (props, propName, componentName) => {
     if(props[propName]){
         let value = props[propName];
         if(typeof value !== 'string' || value.length > 80){
             return new Error(`${propName} in ${componentName} is longer than 80 character`);
         }
     }
}


const cardDragSpec = {
    beginDrag(props){
        return {
            id: props.id
        };
    },
    //结束拖拽时，持久化数据
    endDrag(props){
        props.cardCallBacks.persistCardDrag(props.id,props.status);
    }
};


const cardDropSpec = {
     hover(props, monitor) {
         const draggedId = monitor.getItem().id;
        //  props.cardCallbacks.updatePosition(draggedId,props.id);
        props.cardCallBacks.updateCardPosition(draggedId,props.id)
     }
};


let collectDrag = (connect,monitor) => {
     return {
         connectDragSource: connect.dragSource()
     };
}

let collectDrop = (connect, monitor) => {
    return {
        connectDropTarget: connect.dropTarget(),
    };
}

 class Card extends React.Component{

    constructor(){
        super(...arguments);
        this.state = {
            showDetails: false
        }
    }

    toggleDetails(){
        this.setState( { showDetails: !this.state.showDetails })
    }

      render(){
        
          const { connectDragSource, connectDropTarget  } = this.props;

          let cardDetails;
          if(this.state.showDetails){
              cardDetails = (
                 <div className="card__details">
                      <span dangerouslySetInnerHTML={{__html:marked(this.props.description)}} />
                      {/* { this.props.description} */}
                      <CheckList cardId = { this.props.id} tasks={this.props.tasks} taskCallbacks={this.props.taskCallbacks} />
                 </div>
              );
          };

        
          //动画样式
          let sideColor = {
              position: 'absolute',
              zIndex: -1,
              top: 0,
              bottom: 0,
              left: 0,
              width: 7,
              backgroundColor: this.props.color
          };

          return connectDropTarget(connectDragSource(
              <div className="card">
              <div style={sideColor}/>
                     <div className={this.state.showDetails ? "card__title card__title--is-open" : "card__title" } onClick={ ()=> this.setState({ showDetails: !this.state.showDetails })}>
                        { this.props.title}
                    </div>
                    <ReatcCSSTransitionGroup transitionName="toggle"
                                             transitionEnterTimeout={250}
                                             transitionLeaveTimeout={250}>
                        {cardDetails}
                    </ReatcCSSTransitionGroup>
              </div>
          ));
      }
}



Card.propTypes = {
    id: PropTypes.number,
    title: titlePropType,
    description: PropTypes.string,
    color: PropTypes.string,
    tasks: PropTypes.arrayOf(PropTypes.object),
    taskCallbacks: PropTypes.object,
    cardCallBacks: PropTypes.object,
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired
};


const dragHighOrderCard = DragSource(constants.CARD,cardDragSpec,collectDrag)(Card);
const dragDropHighOrderCard = DropTarget(constants.CARD,cardDropSpec, collectDrop)(dragHighOrderCard);

export default dragDropHighOrderCard;