/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";

console.log('Script started successfully');

let currentPopup: any = undefined;
let originalMoveFunction: any = undefined;

// Waiting for the API to be ready
WA.onInit().then(() => {
    console.log('Scripting API ready');
    console.log('Player tags: ', WA.player.tags);

    WA.room.area.onEnter('clock').subscribe(() => {
        const today = new Date();
        const time = today.getHours() + ":" + today.getMinutes();
        currentPopup = WA.ui.openPopup("clockPopup", "It's " + time, []);
    });

    WA.room.area.onLeave('clock').subscribe(closePopup);

    // The line below bootstraps the Scripting API Extra library that adds a number of advanced properties/features to WorkAdventure
    bootstrapExtra().then(() => {
        console.log('Scripting API Extra ready');
    }).catch(e => console.error(e));
    WA.onInit().then(() => {
    WA.room.area.onEnter('inside').subscribe(() => {
        WA.room.hideLayer('hide/inside');
        WA.room.showLayer('hide/outside');
    });

    WA.room.area.onEnter('outside').subscribe(() => {
        WA.room.hideLayer('hide/outside');
        WA.room.showLayer('hide/inside');
    });
    }).catch(e => console.error(e));
}).catch(e => console.error(e));

function closePopup() {
    if (currentPopup !== undefined) {
        currentPopup.close();
        currentPopup = undefined;
    }
}
WA.onInit().then(() => {
    async function startIceSkating() {
        originalMoveFunction = WA.player.moveTo;
        WA.player.moveTo = async (): Promise<{ x: number; y: number; cancelled: boolean }> => {
            const position = await WA.player.getPosition();
            const randomX = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
            const randomY = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
            const newX = position.x + randomX;
            const newY = position.y + randomY;
            console.log('Moving to:', newX, newY);
            try {
                await originalMoveFunction(newX, newY, 10);
                console.log('Move successful');
                return { x: newX, y: newY, cancelled: false };
            } catch (error) {
                console.log('Move failed:', error);
                return { x: position.x, y: position.y, cancelled: true };
            }
        };
    }

    function stopIceSkating() {
        if (originalMoveFunction) {
            WA.player.moveTo = originalMoveFunction;
            originalMoveFunction = undefined;
        }
    }

    WA.room.area.onEnter('ice').subscribe(() => {
        startIceSkating();
    });
    WA.room.area.onLeave('ice').subscribe(() => {
        stopIceSkating();
    });
}).catch(e => console.error(e));

export {};