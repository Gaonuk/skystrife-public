import type { Entity } from "@latticexyz/recs";
import type { PluginLayer } from "client/src/layers/Plugins/createPluginLayer";

/**
 * Plugins must define a function named `createPlugin` that takes `PluginLayer` and returns an object with `mount` and `unmount` methods.
*/
function createPlugin(pluginLayer: PluginLayer) {
  const {
    ui: {
      preact: {
        html,
        render,
        h,
        hooks: { useState, useMemo, useEffect },
      },
      hooks: { usePlayersInMatch, },
      components: { Button, Select }
    },
    parentLayers: {
      local: {
        api: {
          getPlayerInfo
        },
      },
      network: {
        utils: {
          getCurrentPlayerEntity,
          getMatchVotes,
        },
        api: {
          vote
        }
      },
    },
    hotkeyManager,
  } = pluginLayer;
  
  function Spacer() {
    return html`<div style=${{ height: "8px" }}></div>`;
  }

  return {
    mount: (container: HTMLDivElement) => {

      function App() {
        const playersInMatch = usePlayersInMatch();
        const [countdown, setCountdown] = useState(120); // 2 minutes in seconds
        const [selectedPlayer, setSelectedPlayer] = useState<Entity>();
        const currentPlayerEntity = getCurrentPlayerEntity();
        const playerVotes = getMatchVotes();

        useEffect(() => {
          const interval = setInterval(() => {
            setCountdown((prevCountdown) => prevCountdown - 1);
          }, 1000);

          // Cleanup
          return () => clearInterval(interval);
        }, []);

        // fetch match votes every 5 seconds
        const hasPlayerVoted = useMemo(() => {
          if (!currentPlayerEntity) return false;
          return Boolean(playerVotes.find((i) => i === currentPlayerEntity));
        }, [playerVotes]);

        const executeVote = () => {
          if (!currentPlayerEntity) return;
          if (!selectedPlayer) {
            alert("Please select a player to vote for!");
            return;
          }
          vote(currentPlayerEntity, selectedPlayer);
          console.log(`Vote executed for: ${selectedPlayer}`);
        };

        const options = useMemo(() => {
          const playerValues = [{
            value: "",
            label: "Select Player"
          }]
          const newArr = playerValues.concat(playersInMatch.map((player) => ({ value: player, label: getPlayerInfo(player)?.name })));
          return newArr;
        }, [playersInMatch]);

        return html`<div style=${{ maxWidth: "320px", display: "flex", flexDirection: "column" }}>
          <h2>Choose who will be destroyed! 😃</h2>
          
          <${Spacer} />

          <${Select}
            ...${{
              label: "Select Player",
              options,
              value: selectedPlayer,
              onChange: (value: Entity) => { 
                setSelectedPlayer(value)
              },
              style: { width: "100%" },
              containerStyle: { width: "100%" },
            }}
          />
          
          <${Spacer} />
          
          <${Button}
            ...${{
              buttonType: "primary",
              label: "Execute",
              style: { width: "100%" },
              onClick: executeVote,
            }}
          />
          
          <${Spacer} />
          
          <div style=${{ border: "1px solid red", padding: "8px", borderRadius: "4px", fontWeight: "bold", overflow: "auto", maxHeight: "150px" }}>
            <p style=${{ margin: "0", color: "red", wordWrap: "break-word" }}>${hasPlayerVoted ? "You have already voted" : "Vote Now!"}</p>
          </div>
        </div>`;
      }

      render(h(App, {}), container);
    },
    unmount: () => {
      hotkeyManager.removeHotkey("f");
    },
  };
}
