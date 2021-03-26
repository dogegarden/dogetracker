$(document).ready(function(){
    function update() {
        $.ajax({
            url: '/api/rooms',
            success: (payload) => {
                let rooms = payload.rooms
                console.log(rooms)
                document.getElementById("roomCount").innerText = rooms.length;
                for (i=0; i<rooms.length; i++) {
                    if (document.getElementsByClassName("right-col-rooms")[i] == undefined) {
                        // Need to add data - Error: If both rooms have one person, it can take the previous room as the values.
                        document.getElementsByClassName("accounts-wrapper")[0].innerHTML += 
                        `<a target="_blank" href="https://dogehouse.tv/room/${rooms[i].id}">
                        <div class="card accounts-card">
                            <div class="card-body border-r">
                                <div class="con-grid1">
                                    <img class="account-avatar" src="https://avatars.githubusercontent.com/u/80551136?s=280&v=4">
                                    <div class="account-text" style="line-height: 15px; text-align: left;">
                                    ${rooms[i].name}<br>
                                        <span style="font-size: 10px; --tw-text-opacity: 1; color: rgba(154.148,165.363,177.352,var(--tw-text-opacity));">${rooms[i].id}</span>
                                    </div>
                                    <div class="right-col-rooms">
                                      <i class="fas fa-user-friends"></i>
                                      ${rooms[i].numPeopleInside}
                                    </div>
                                </div>
                                <br><br>
                            </div>
                        </div>
                    </a><br>`
                    }
                    document.getElementsByClassName("right-col-rooms")[i].innerHTML = `<i class="fas fa-user-friends" aria-hidden="true"></i> `+rooms[i].numPeopleInside;
                    if (rooms.some(rooms => rooms.id == document.getElementsByClassName("account-text")[i].children[1].innerText)) {
                        // Room Exists
                        console.log(`Valid Room at Index ${i}`)
                    } else {
                        // Remove Room
                        // Not working?
                        console.log(`Remove ${i}`)
                        // document.getElementsByClassName("accounts-wrapper")[0].children[i*2-1].remove();
                        // document.getElementsByClassName("accounts-wrapper")[0].children[i*2-1].remove();
                    }
                };
            }
        });
    }
  
    update();
    setInterval(update, 10000);
  });
  