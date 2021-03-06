import React from 'react';
import 'whatwg-fetch';
import KanbanBoard from './KanbanBoard';
import update from 'react-addons-update';
import { throttle } from './utils';



const API_URL = 'http://kanbanapi.pro-react.com';
const API_HEADERS = {
    'Content-Type': 'application/json',
    Authorization: 'any-string-you-like',
};

export default class KanbanBoardContainer extends React.Component{

      constructor(){
          super(...arguments);
          this.state = {
              cards: [],
          };

          //Only call updateCardStatus when arguments change
          this.updateCardStatus = throttle(this.updateCardStatus.bind(this));
          //Call updateCardPosition at max every 500ms(or when arguments change) 
          this.updateCardPosition = throttle(this.updateCardPosition.bind(this),500);
      }

      

      componentDidMount(){
          fetch(`${API_URL}/cards`, { headers: API_HEADERS })
               .then( resp => resp.json())
               .then( responseData => {
                   this.setState({ 
                       cards: responseData 
                    })
                   window.state = this.state;
               })
              
      }


      addTask(cardId,taskName){
          let prevState = this.state;
            //Find the index of card
            let cardIndex = this.state.cards.findIndex( card => card.id === cardId);
           //create a new task with the given name and a temporary id
           let newTask = { id:Date.now(), name: taskName, done:false};
           //create a new object and push the new task to the array of task
           let nextState = update(this.state.cards,{
               [cardIndex]: {
                   tasks: { $push: [newTask] }
               }
           });
           //set the component state to the mutated object
           this.setState( { cards: nextState });
            //Call the API to add the task on the server
            fetch(`${API_URL}/cards/${cardId}/tasks`,{
                method: 'post',
                headers: API_HEADERS,
                body: JSON.stringify(newTask)
          }).then( resp => {
              if(resp.ok){
                  return resp.json()
              }else{
                  throw new Error("Server response wasn't OK")
              }
          }).then((responseData) => {
             return newTask.id = responseData.id,
              this.setState({ cards: nextState });
          })
          .catch( error => {
              this.setState({ prevState });
          });
      }

      deleteTask(cardId, taskId, taskIndex){
     
           //Find the index of card
           let cardIndex = this.state.cards.findIndex( (card) => card.id === cardId);
           //Create a new object without the task
           let prevState = this.state;

           let nextState = update(this.state.cards, {
               [cardIndex]: {
                   tasks: {$splice:[[taskIndex,1]]}
               }
           });

           //set the component state to the mutated object
           this.setState({ cards: nextState });

           //Call the API to remove the task on the server
           fetch(`${API_URL}/cards/${cardId}/tasks/${taskId}`,{
                 method: 'delete',
                 headers: API_HEADERS
           }).then( resp => {
               if(!resp.ok){
                   throw new Error("Server response wasn't OK")
               }
           }).catch( error => {
                console.error("Fetch error:", error);
                this.setState(prevState)
           });
      }

      toggleTask(cardId, taskId, taskIndex){
            let prevState = this.state;
            //Find the index of card
            let cardIndex = this.state.cards.findIndex( card => card.id === cardId); 
            //Save a reference to the task's 'done' value
            let newDoneValue;
            //Using the $apply commond, you will change the done value to its opposite
            let nextState = update(this.state.cards,{
                [cardIndex]: {
                    tasks: {
                        [taskIndex]:{
                            done: { $apply: done => {
                                newDoneValue = !done
                                return newDoneValue;
                            }}
                        }
                    }
                }
            });
            //set the component state to the mutated object
            this.setState({ cards: nextState });

            //Call the API to toggle the task on the server
           fetch(`${API_URL}/cards/${cardId}/tasks/${taskId}`,{
            method: 'put',
            headers: API_HEADERS,
            body: JSON.stringify({ done: newDoneValue })
      }).then(resp => {
          if(!resp.ok){
              throw new Error("Server response wasn't OK")
          }
      }).catch(error => {
          console.error("Fetch error:",error);
          this.setState(prevState);
      });
      }



    updateCardStatus(cardId, listId){
        //Find the index of the card
        let cardIndex = this.state.cards.findIndex( card => card.id === cardId);
        //Get the current card
        let card = this.state.cards[cardIndex];
        //Only proceed if hovering over a different list
        if(card.status !== listId){
            //Set the component state to the mutated object
            this.setState(update(this.state,{
                cards: {
                    [cardIndex]: {
                        status: { $set: listId }
                    }
                }
            }));
        }
    }



    updateCardPosition(cardId, afterId){
        //Only proceed if hovering a different card
        if(cardId !== afterId){
            //Find the index of the card
            let cardIndex = this.state.cards.findIndex( card => card.id === cardId);
            //get the current card
            let card = this.state.cards[cardIndex];
            //Find the index of the card the user is hovering over 
            let afterIndex = this.state.cards.findIndex(card => card.id === afterId);
            //use splice to remove the card and reinsert it a the new index
            this.setState(update(this.state,{
                 cards: {
                     $splice: [
                         [cardIndex, 1],
                         [afterIndex, 0, card]
                     ]
                 }
            }))
        }
    }


    persistCardDrag(cardId, status){
        //Find the index of the card
        let cardIndex = this.state.cards.findIndex( card => card.id == cardId);
        //Get the current card
        let card = this.state.cards[cardIndex];

        fetch(`${API_URL}/cards/${cardId}`,{
             method: 'put',
             headers: API_HEADERS,
             body: JSON.stringify({ status: card.status,row_order_position: cardIndex})
        })
          .then((resp) => {
              if(!resp.ok){
                  //Throw an error if server response wasn't 'ok'.
                  //so you can revert back the optimistic changes.
                  //made to the UI.
                  throw new Error("Server response wasn't OK")
              }
          })
          .catch( error => {
              console.error('Fetch error:', error);
              this.setState(
                  update(this.state, {
                      cards: {
                          [cardIndex]: {
                            status: { $set: status}
                          }
                      }
                  })
              );
          });
    }

      render(){
          return(
              <KanbanBoard cards={this.state.cards}
                            taskCallbacks={{
                                toggle: this.toggleTask.bind(this),
                                delete: this.deleteTask.bind(this),
                                add: this.addTask.bind(this)
                            }} cardCallBacks={{
                                 updateCardStatus: this.updateCardStatus,
                                 updateCardPosition: this.updateCardPosition,
                                 persistCardDrag: this.persistCardDrag.bind(this)
                            }}/>
          );
      }
}