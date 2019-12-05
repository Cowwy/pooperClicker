// =======================================================
//  GAME INITIALIZATION
// =======================================================
function initPooStoreContorl( ) {
    let buyBtn            = $D.id( "buyBtn" );
    let sellBtn			  = $D.id( "sellBtn" );
    let _1xBtn 		      = $D.id( "1x" );
    let _10xBtn           = $D.id( "10x" );
    let _100xBtn          = $D.id( "100x" );

    //UPGRADE -> QUANTITY CONTROLS
    buyBtn.addEventListener(  "click", buyBtnPress );
    sellBtn.addEventListener(  "click", sellBtnPress );
    _1xBtn.addEventListener(   "click", ( e ) => quantity( e, 1 ) );	
    _10xBtn.addEventListener(  "click", ( e ) => quantity( e, 10 ) );
    _100xBtn.addEventListener( "click", ( e ) => quantity( e, 100 ) );

    // =========================================
    //  PANEL -> POO STORE -> QUANTITY CONTROLS
    // =========================================
    function buyBtnPress( e ) {
        sellBtn.className = "optionBtn";
        buyBtn.className  = "optionBtn active";
        $ST.buyOrSellToggle( true );
        updateQuantityCost( );
    }
    
    function sellBtnPress( e ) {
        buyBtn.className  = "optionBtn";
        sellBtn.className = "optionBtn active";
        $ST.buyOrSellToggle( false );
        updateQuantityCost( );
    }

    function quantity( e, quantity ) {
        removeAllActiveQuantity( );
        e.srcElement.className = e.srcElement.className + " active";
        $ST.setBuyOrSellQuantity( quantity );
        updateQuantityCost( );
    }

    //Utility Function
    function removeAllActiveQuantity( ) {
        $PC.getQuantity( ).forEach( function(element) {
            $D.id( element ).className = "quantityBtn";
        });
    }

    function updateQuantityCost( ) {
        //=====================================================
        // GET ALL THE UPGRADABLE ELEMENTS ON THE UPGRADELIST
        //=====================================================
        let upgradeListElement = $D.id( "upgradeList").childNodes;

        //=====================================================
        // UPDATE ALL THE PRICES ON THE LIST - BUY
        //=====================================================
        if( $ST.getBuyOrSell( ) ) {
            upgradeListElement.forEach( function( element ) {
                let name 		   = (element.id).replace("Upgrade", "");	//Shovel
                let curLevel       = $ST.getUpgradeLevel( name );			//Level 43
                let increment      = $ST.getBuyOrSellQuantity( );	//1 / 10 / 100

                let costId         = name + "Cost";							//ShovelCost
                let upgradeElement = $D.id( costId );		//Shovel Upgrade Element

                let sum            = $PC.calcSumPrice( name, curLevel, increment );
                let newCost        = $ST.getDisplayNotation( sum );
                
                upgradeElement.innerHTML = newCost;
            });
        }

        //=====================================================
        // UPDATE ALL THE PRICES ON THE LIST - SELL
        //=====================================================
        else {
            upgradeListElement.forEach( function( element ) {
                let name 		   = (element.id).replace("Upgrade", "");	//Shovel
                let curLevel       = $ST.getUpgradeLevel( name );			//Level 43
                let decrement      = $ST.getBuyOrSellQuantity( );	//1 / 10 / 100

                let costId         = name + "Cost";							//ShovelCost
                let upgradeElement = $D.id( costId );		//Shovel Upgrade Element

                let sum            = $PC.calcSellPrice( name, curLevel, decrement );
                let refundAmt      = $ST.getDisplayNotation( sum );
                
                upgradeElement.innerHTML = refundAmt;
            });
        }
    }
}

function initSettingControl( ) {
    let ngBtn   = $D.id( "ngBtn" );
    let saveBtn = $D.id( "saveBtn" );

    saveBtn.addEventListener( "click", ( e ) => {
        SaveData.saveGame( e );
        _makeSaveDataSlot( );
    });		
    ngBtn.addEventListener( "click", ng );

    //SET ALL THE LOADING STUFF HERE
    _makeSaveDataSlot( );

    // =========================================
    //  SETTING - MAKE LOADING SLOT
    // =========================================
    function _makeSaveDataSlot( ) {
        const data      = SaveData.localStorageToSetting( );
        const container = $D.id( "setting-saveData" );
              container.innerHTML = "";

        data.forEach( (game) => {
            let time    = formatMinimalGameTime( reduceTime( game[1]["Time"]["sessionRunTime"] ) );
            let saveTxt = `${game[1]["WorldName"]} @ ${time}`;

            let tmpCont = $D.id( "tempSaveSlot" ).cloneNode( true );
            let tmpName = tmpCont.children[0].children[0];
            let tmpCls  = tmpCont.children[1].children[0];

            //INSERT CONTENT
            tmpName.setAttribute( "id", game[0] );
            tmpCls.setAttribute( "id", game[0] );

            tmpName.innerHTML = saveTxt;

            //INSERT LISTENER
            tmpName.addEventListener( "click", (e) => {
                ng( e.srcElement.id, game[1] );
            });

            tmpCls.addEventListener( "click", (e) => {
                localStorage.removeItem( e.srcElement.id );
                _makeSaveDataSlot( );
            });

            container.appendChild( tmpCont );
        });
    }

    // =======================================================
    //  FUNCTION 	clearGame
    //  Clear Game Setup - Before Starting the next game
    // =======================================================
    function ng( slotID, data ) {
        clearInterval( updateTimer );   //CLEAR GAME LOOP
        updateTimer = null;

        $ST.reset( );

        if( slotID && data ) {
            $ST.makeGame( slotID, data );
        }

        resetWorldMsg( );               //RESET WORLD MESSAGE
        resetAllPanels( );              //UPGRADE LIST | TECH TREE | ACHIEVEMENTS
        resetStatistic( );              //CLEAR ALL STATISTICS
        resetQuantity( );               //RESET ALL QUANTITY

        initSessionState( );            //SET SESSION STATE  

        enterGame( );

        function resetWorldMsg( ) {
            //CLEAR WORLD MESSAGE   
            let x = $D.id( "randomMessage" );
                x.className = "";
                x.className = "staticMessage";
                x.innerHTML = "There is a piece of poo laying around on our beautiful planes..."
        }
        
        function resetAllPanels( ) {
            $D.id( "upgradeList" ).innerHTML    = "";     //CLEAR UPGRADE LIST
            $D.id( "techList" ).innerHTML       = "";     //CLEAR TECH TREE LIST
            $D.id( "achievementTab" ).innerHTML = "";     //CLEAR ACHIEVEMENTS
        }
        
        function resetStatistic() {
            $D.id("currentTime").innerHTML = "0";
            $D.id("totalPooCollected").innerHTML = "0";
            $D.id("totalClicksMade").innerHTML = "0";
            $D.id("totalPooSinceStart").innerHTML = "0";
            $D.id("totalUpgrades").innerHTML = "0";
        
            $D.id("ppsDisplay").innerHTML = "per second: 0";  //RESET POO PER SECONDS
            $D.id("totalPooDisplay").innerHTML = "0 POOPS";   //RESET POO COUNT
            $D.id("nameInput").value = "Poopy World";         //RESET WORLD NAME
            
            $D.id( "upgradeChart" ).innerHTML = "";
        }
        
        //=================================================================
        // RESET CONTROL - UTILITY METHODS
        //=================================================================
        function resetQuantity( ) {
            $PC.getQuantity( ).forEach( function( element ) {
                $D.id( element ).className = "quantityBtn";
            });
        
            $D.id( "1x" ).className      = "quantityBtn active";
            $D.id( "buyBtn" ).className  = "optionBtn active";
            $D.id( "sellBtn" ).className = "optionBtn";
        }
    }
}

function initPanelControl( ) {
    let upgradeClsBtn     = $D.id( "upgradeClsBtn" );
    let statsClsBtn       = $D.id( "statsClsBtn" );
    let settingClsBtn     = $D.id( "settingClsBtn" );

    let upgradeBtn        = $D.id( "upgradeBtn" );
    let statsBtn          = $D.id( "statsBtn" );
    let settingBtn        = $D.id( "settingBtn" );
    //let techBtn           = $D.id( "techBtn" );

    
    //PANEL CONTROLS
    upgradeClsBtn.addEventListener( "click", (e) => toggleControl( "upgradeScreen" ) );
    statsClsBtn.addEventListener( "click",   (e) => toggleControl( "statsScreen" ) );
    settingClsBtn.addEventListener( "click", (e) => toggleControl( "settingScreen" ) );

    upgradeBtn.addEventListener( "click", (e) => toggleControl( "upgradeScreen" ) );
    statsBtn.addEventListener(   "click", (e) => toggleControl( "statsScreen" ) );
    settingBtn.addEventListener( "click", (e) => toggleControl( "settingScreen" ) );

    function toggleControl( id ) {
        $PC.toggleScreen( id );
        $ST.toggleActiveScreen( id );
    }
}

function initGameControls( ) {
    let giantPoo          = $D.id( "pooClicker" );
    let worldNameInput    = $D.id( "worldNameBlock" );

    //MAIN SCREEN -> POO CONTROL & WORLD NAME CHANGE
    giantPoo.addEventListener( "mousedown", (e) => e.srcElement.className = "cursorGrabbing" );
    giantPoo.addEventListener( "mouseup", (e) => e.srcElement.className = "cursorOpen" );
    giantPoo.addEventListener( "click", poo_onClick );

    worldNameInput.addEventListener( "click", changeInputClicked );

    // =========================================
    //  MAIN SCREEN -> WORLD NAME INPUT
    // =========================================
    function changeInputClicked( e ) {
        let input = $D.id( "nameInput" );
            input.disabled = false;
            input.select( );

        input.addEventListener( "change", nameEntered );
    }

    function nameEntered( e ) {
        this.removeEventListener( "change", nameEntered );
        this.disabled = true;

        $ST.setWorldName( this.value );
    }


    // =========================================
    //  MAIN SCREEN -> GIANT POO
    // =========================================
    function poo_onClick( e ) {
        let manualPooGenerated = hackMode ? hackClickAmt : $ST.calcPooPerClick( );

        //Pop up number after clicking
        //disappears after 1 seconds
        createPooNumber( );
        $PC.playPooClickSFX( );

        if( hackMode ) {
            $ST.addPoo( hackClickAmt );
            $ST.addPooSinceStart( hackClickAmt );
            $ST.addClick( 1 );

        } else {
            $ST.addPoo( manualPooGenerated );
            $ST.addPooSinceStart( manualPooGenerated );

            $ST.addClick( 1 );
        }


        function createPooNumber( ) {
            let pooArea = $D.id( "pooArea" );

            let tempDiv = document.createElement( "div" );
            let txtNode = document.createTextNode( "+" + $ST.getDisplayNotation( manualPooGenerated ) );

            tempDiv.setAttribute( "class", "pooClicked" );
            tempDiv.style.left = GameUtility.between(-85, 120) + "px";
            tempDiv.style.top  = (e.offsetY-50) + "px";
            tempDiv.style.opacity = 1.0;

            tempDiv.appendChild( txtNode );
            pooArea.appendChild( tempDiv );

            const selfDestruct = new PooTimer( tempDiv, 3000, 15, "poo" );
            selfDestruct.start( );
        }
    }
}

function initSessionState( ) {
    $PC.getMessageBoardUpdate( ); 	//SET RANDOM MESSAGE BOARD ID 1 & 2
}



// =======================================================
//  FUNCTION 	devNoteControlSetup
//  TOGGLE DEVELOPMENT PAGE
// =======================================================
function devNoteControlSetup( ) {
    $D.id( "devNoteToggle" ).addEventListener( "click", function( ) {
        $D.id( "devNote" ).style.display = "block";
    });

    $D.id( "closeDevNote" ).addEventListener( "click", function( ) {
        let devNote = $D.id( "devNote" );

        devNote.scrollTop = 0;
        devNote.style.display = "none";
    }); 

    dNote.getDNotes.forEach( (entry) => {
        $D.id( "devNoteEntry" ).innerHTML += entry;
    });
    
}

function addDevNotes( ) {

}

function headerSetup( ) {
    const title = `POOPER CLICKER &copy ${$ST.Copyright("dateTo")}`;
    $D.id( "browserTitle" ).innerHTML = `${title} | ${$ST.Copyright("version")}`;
    $D.id( "navTitle" ).innerHTML = `${title} | ${$ST.Copyright("version")}`;
}

function runTransition( ) {
    const transEl = $D.id( "transition" );
    transEl.style.display = "block";
    transEl.className = "transAnimation";

    const ngTransition = setInterval( ( e ) => {    
        transEl.className = "";
        transEl.style.display = "none";
        clearInterval( ngTransition );
    }, 500 );
}