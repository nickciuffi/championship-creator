import { useNavigate } from "react-router-dom";
import { useParticipants } from "../../CustomHooks/useParticipants";
import {useEffect, useState} from 'react'
import { ParticipantProps } from "../../props/participants";
import { Key } from "../../components/key";
import { Game } from "../../components/game";

type keysProps = {
    side1: key[],
    side2: key[],
}
export type game = {
    participants: ParticipantProps[];
    winner?: ParticipantProps;
} 

type key = {
    games: game[]
}
type JogoAtualProps = {
    side: 1 | 2,
    key: number,
    id: number,
}



export function GameShower(){

   const [final, setFinal] = useState<game>( {participants: [{name: "???"}, {name: "???"}]});

   const [jogoAtual, setJogoAtual] = useState<JogoAtualProps>({side: 1, id: 0, key: 0});
   const [numJogo, setNumJogo] = useState<number>(1);

   const navigate = useNavigate();
   const {participants} = useParticipants();

    const [keys, setKeys] = useState<keysProps>({
        side1: [],
        side2: []
    })

    function verifyInitialWinners(dado: key){

        const newDados = {...dado};

        newDados.games.forEach((game, i) => {
            if(game.participants[0].id === undefined){
                newDados.games[i].winner = game.participants[1];
            }
            else if(game.participants[1].id === undefined){
                newDados.games[i].winner = game.participants[0];
            }
        })
      return newDados;
    }
    
    
   function generateNextKeys(nextKeys: key[]){

    
        if(nextKeys[nextKeys.length - 1].games.length == 1) return nextKeys
        
        const nextKeyEmpty: game[] = new Array(Math.ceil(nextKeys[nextKeys.length-1].games.length / 2)).fill({participants: [{name: "???"}, {name: "???"}]});
        const nextKey = nextKeyEmpty.map((game, id) => {
           if(nextKeys[nextKeys.length - 1].games[id*2].winner){
                 return {participants: [nextKeys[nextKeys.length - 1].games[id*2].winner as ParticipantProps, {name: "???"}]};
            }
            if(nextKeys[nextKeys.length - 1].games[(id*2)+1]) {
           
            if(nextKeys[nextKeys.length - 1].games[(id*2)+1].winner){
                return {participants: [{name: "???"}, nextKeys[nextKeys.length - 1].games[id*2+1].winner as ParticipantProps]};
            }
        }
        return game
        })
        const newNextKeys = [...nextKeys, {games: nextKey}]
        return generateNextKeys(newNextKeys);

   }

    function arrangeIntoGames(values: ParticipantProps[]):game[]{
        const arrangedGames: game[] = new Array(Math.ceil(values.length/2)).fill({participants: []})
        let gameId = 0
        for(let i = 0; i < values.length; i+=2){
            arrangedGames[gameId] = {participants: [values[i], values[i+1] ? values[i+1] : {name: '???'}]};
            gameId++;
        }
        return [...arrangedGames]
    }

    function generateKeys(parts: ParticipantProps[]){
        const sortedParts = [];
        const sortObject = [...parts];
        for(let i = 0; sortObject.length > 0; i++ ){
            const num = Math.round(Math.random() * (sortObject.length - 1));
            sortedParts[i] = sortObject[num]; 
            sortObject.splice(num, 1);

        }
        const side1Games: game[] = arrangeIntoGames([...sortedParts])
        const side2Games = side1Games.splice(Math.floor(side1Games.length/2));
        

       
        const nextKeysSide1 = generateNextKeys([
            verifyInitialWinners({ games: side1Games })
        ])
        const nextKeysSide2 = generateNextKeys([
            verifyInitialWinners({games: side2Games})
        ])
        console.log("side1: ", nextKeysSide1);
        console.log("side2: ", nextKeysSide2);
        setKeys({
            side1: nextKeysSide1,
            side2: nextKeysSide2
        })
       
    }

  
    useEffect(() => {
        
        if(participants.length < 2) {
            const pastChampionships = localStorage.getItem('participants');
            
            if(!pastChampionships) return navigate('/');
            const loadedPastChampionships = JSON.parse(pastChampionships) as ParticipantProps[]
            generateKeys(loadedPastChampionships);
        }
        else{
        localStorage.setItem('participants', JSON.stringify(participants));
        generateKeys(participants);
        }
        
    }, [])

    function handleSetWinner(winNum: number){
        const editKeys = {...keys}
        if(jogoAtual.side === 1){
            editKeys.side1[jogoAtual.key].games[jogoAtual.id].winner = editKeys.side1[jogoAtual.key].games[jogoAtual.id].participants[winNum];

        }
        else{
            editKeys.side2[jogoAtual.key].games[jogoAtual.id].winner = editKeys.side1[jogoAtual.key].games[jogoAtual.id].participants[winNum];
        }
        console.log(editKeys)
    }
    
    return (
        <div className="container mx-[auto]">
            <div className="flex  py-[60px] justify-center h-[100%] items-center">
            <div className="flex gap-6 mr-6">
                { keys.side1.map((k, i) => <Key key={i} games={k.games} />)}
            </div>
            <div className="flex flex-col items-center relative"><p className="absolute top-[-30px]">Final</p><Game participant1={final.participants[0]} participant2={final.participants[1]}/></div>
            <div className="flex gap-6 flex-row-reverse ml-6">
                {keys.side2.map((k, i) => <Key key={i} games={k.games} />)}
            
            </div>
            </div>
            <div className="">
                <p className="text-center text-2xl ">Quem venceu o jogo {numJogo}?</p>
                <div className="flex justify-around items-center mt-10">
                <a className="bg-green-700 text-white py-4 px-6 rounded-md text-xl" onClick={() => handleSetWinner(0)}>{
                    keys.side1.length === 0 ? <> Loading</> :
                jogoAtual.side == 1 ? 
                keys.side1[jogoAtual.key].games[jogoAtual.id].participants[0].name
                    : keys.side2[jogoAtual.key].games[jogoAtual.id].participants[0].name
            }</a>
            OU
            <a className="bg-green-700 text-white py-4 px-6 rounded-md text-xl" onClick={() => handleSetWinner(1)}>
                {
                    keys.side2.length === 0 ? <> Loading</> :
            jogoAtual.side == 1 ? 
                keys.side1[jogoAtual.key].games[jogoAtual.id].participants[1].name
                    : keys.side2[jogoAtual.key].games[jogoAtual.id].participants[1].name
                }
            </a>
            </div>
            </div>
        </div>
    )
}