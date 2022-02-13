import React, { useState, useEffect } from "react";
import {
    Text,
    View,
    Image,
    Modal,
    TextInput,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import firestore from "../firebase-config";
import {
    collection,
    getDocs,
    getDoc,
    doc,
    setDoc,
    addDoc,
    deleteDoc,
} from "firebase/firestore";
import DropDownPicker from "react-native-dropdown-picker";
import CryptoES from "crypto-es";

const RoomList = ({ navigation, route }) => {
    const [userId, setUserId] = useState("");
    const [houseId, setHouseId] = useState("");
    const [numRoom, setNumRoom] = useState(0);
    const [roomList, setRoomList] = useState([]);
    const [renderScreen, setRenderScreen] = useState(0);
    const [roomNameValid, setRoomNameValid] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [roomName, setRoomName] = useState(null);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [roomTypeList, setRoomTypeList] = useState([
        {
            label: "Living room",
            value: "living room",
            icon: () => (
                <Image
                    source={require("../assets/living-room-2-icon.png")}
                    style={styles.dropdownIcon}
                />
            ),
        },
        {
            label: "Kitchen",
            value: "kitchen",
            icon: () => (
                <Image
                    source={require("../assets/kitchen-2-icon.png")}
                    style={styles.dropdownIcon}
                />
            ),
        },
        {
            label: "Bath room",
            value: "bath room",
            icon: () => (
                <Image
                    source={require("../assets/bath-room-2-icon.png")}
                    style={styles.dropdownIcon}
                />
            ),
        },
        {
            label: "Bed room",
            value: "bed room",
            icon: () => (
                <Image
                    source={require("../assets/bed-room-2-icon.png")}
                    style={styles.dropdownIcon}
                />
            ),
        },
    ]);

    const [showEditForm, setShowEditForm] = useState(false);
    const [activeTab, setActiveTab] = useState("rename");
    const [newName, setNewName] = useState("");
    const [password, setPassword] = useState("");
    const [roomId, setRoomId] = useState("");

    useEffect(async () => {
        setUserId(route.params.id);
        setHouseId(route.params.houseId);
        updateRoomList();
    }, []);

    const updateRoomList = async () => {
        var id = route.params.houseId;
        var roomIdList = [];
        var rooms = [];
        const querySnapshot = await getDocs(collection(firestore, "room"));
        var index = 0;
        querySnapshot.forEach((doc) => {
            if (doc.data().houseId == id) {
                console.log(doc.id, " => ", doc.data());
                index++;
                roomIdList.push(doc.id);
            }
        });
        setNumRoom(index);

        if (roomIdList.length) {
            var object1,
                object2 = {};
            for (let i = 0; i < roomIdList.length; i++) {
                var room = await getDoc(doc(firestore, "room", roomIdList[i]));
                if (i % 2 == 0) {
                    object1 = {
                        id: room.id,
                        name: room.data().name,
                    };
                    switch (room.data().type) {
                        case "living room":
                            object1.icon = require("../assets/living-room-icon.png");

                            break;

                        case "kitchen":
                            object1.icon = require("../assets/kitchen-icon.png");
                            break;

                        case "bath room":
                            object1.icon = require("../assets/bath-room-icon.png");

                            break;

                        case "bed room":
                            object1.icon = require("../assets/bed-room-icon.png");

                            break;
                    }
                } else {
                    object2 = {
                        id: room.id,
                        name: room.data().name,
                    };
                    switch (room.data().type) {
                        case "living room":
                            object2.icon = require("../assets/living-room-icon.png");

                            break;

                        case "kitchen":
                            object2.icon = require("../assets/kitchen-icon.png");
                            break;

                        case "bath room":
                            object2.icon = require("../assets/bath-room-icon.png");

                            break;

                        case "bed room":
                            object2.icon = require("../assets/bed-room-icon.png");

                            break;
                    }
                    rooms.push([object1, object2]);
                }
            }
            if (roomIdList.length % 2) {
                rooms.push([object1]);
            }
        }
        console.log(rooms);

        setRoomList(rooms);
    };

    useEffect(() => {
        setTimeout(() => {
            setRenderScreen(renderScreen + 1);
        }, 500);
    }, [roomList, modalVisible]);

    const addRoom = async () => {
        if (roomName && value) {
            await addDoc(collection(firestore, "room"), {
                houseId: houseId,
                name: roomName,
                type: value,
            });

            setValue(null);
            setRoomName(null);
            setModalVisible(false);

            updateRoomList();
        }
    };

    const showRoomList = () => {
        if (roomList.length)
            return roomList?.map((room) => {
                return (
                    <View
                        key={room[0].id}
                        style={{ margin: 10, flexDirection: "row" }}
                    >
                        <TouchableOpacity
                            style={styles.roomBtn}
                            onPress={() => {
                                navigation.navigate("Device Manager", {
                                    id: userId,
                                    houseId: houseId,
                                    roomId: room[0].id,
                                });
                            }}
                            onLongPress={() => {
                                setShowEditForm(true);
                                setRoomId(room[0].id);
                            }}
                            delayLongPress={500}
                        >
                            <Image
                                style={styles.roomLogo}
                                source={room[0].icon}
                            />
                            <Text style={styles.buttonText}>
                                {room[0].name}
                            </Text>
                        </TouchableOpacity>

                        {room.length == 2 ? (
                            <TouchableOpacity
                                style={styles.roomBtn}
                                onPress={() => {
                                    navigation.navigate("Device Manager", {
                                        id: userId,
                                        houseId: houseId,
                                        roomId: room[1].id,
                                    });
                                }}
                                onLongPress={() => {
                                    setShowEditForm(true);
                                    setRoomId(room[1].id);
                                }}
                                delayLongPress={500}
                            >
                                <Image
                                    style={styles.roomLogo}
                                    source={room[1].icon}
                                />
                                <Text style={styles.buttonText}>
                                    {room[1].name}
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={styles.addRoomBtn}
                                onPress={() => {
                                    setModalVisible(true);
                                }}
                            >
                                <Image
                                    style={styles.addRoomLogo}
                                    source={require("../assets/add-icon.png")}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                );
            });
    };

    const editRoom = async () => {
        if (activeTab == "rename") {
            console.log(newName);
            const room = await getDoc(doc(firestore, "room", roomId));
            await setDoc(doc(firestore, "room", roomId), {
                name: newName,
                houseId: houseId,
                type: room.data().type,
            });
            setNewName("");
            setShowEditForm(false);
        } else {
            const user = await getDoc(doc(firestore, "account", userId));
            if (user.data().password == CryptoES.SHA256(password).toString()) {
                setShowEditForm(false);
                setActiveTab("rename");

                //delete rooms and devices in the house
                const rooms = await getDocs(collection(firestore, "room"));

                await deleteDoc(doc(firestore, "room", roomId));

                const devices = await getDocs(collection(firestore, "device"));
                devices.forEach((device) => {
                    if (device.data().roomId == roomId) {
                        if (
                            device.data().type == "humidity" ||
                            device.data().type == "temperature"
                        ) {
                            setDoc(doc(firestore, "device", device.id), {
                                linked: false,
                                name: device.data().name,
                                roomId: "",
                                type: device.data().type,
                                value: device.data().value,
                            });
                        } else {
                            setDoc(doc(firestore, "device", device.id), {
                                linked: false,
                                name: device.data().name,
                                roomId: "",
                                type: device.data().type,
                                status: device.data().status,
                            });
                        }
                    }
                });
            }
            setPassword("");
        }
        updateRoomList();
    };

    return (
        <View
            style={
                modalVisible || showEditForm
                    ? styles.containerModalOn
                    : styles.container
            }
        >
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>Add Device</Text>
                    <DropDownPicker
                        style={styles.dropdown}
                        open={open}
                        value={value}
                        items={roomTypeList}
                        setOpen={setOpen}
                        setValue={setValue}
                        setItems={setRoomTypeList}
                    />
                    <TextInput
                        style={styles.inputView}
                        placeholder="Enter room name..."
                        placeholderTextColor="black"
                        onChangeText={(text) => setRoomName(text)}
                    ></TextInput>
                    <View style={{ flexDirection: "row" }}>
                        <TouchableOpacity style={styles.modalBtn}>
                            <Text
                                style={styles.modalTextBtn}
                                onPress={() => {
                                    setModalVisible(false);
                                    setValue(null);
                                    setRoomName(null);
                                }}
                            >
                                Cancel
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalBtn}>
                            <Text style={styles.modalTextBtn} onPress={addRoom}>
                                Submit
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={showEditForm}
                onRequestClose={() => {
                    setModalVisible(!showEditForm);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.editModalView}>
                        <View style={{ flexDirection: "row" }}>
                            <TouchableOpacity
                                style={
                                    activeTab == "rename"
                                        ? styles.modalTabBtnActive
                                        : styles.modalTabBtnInactive
                                }
                            >
                                <Text
                                    style={styles.modalTextBtn}
                                    onPress={() => {
                                        setActiveTab("rename");
                                        setPassword("");
                                    }}
                                >
                                    Rename
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={
                                    activeTab == "delete"
                                        ? styles.modalTabBtnActive
                                        : styles.modalTabBtnInactive
                                }
                            >
                                <Text
                                    style={styles.modalTextBtn}
                                    onPress={() => {
                                        setActiveTab("delete");
                                        setNewName("");
                                    }}
                                >
                                    Delete
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {activeTab == "rename" ? (
                            <TextInput
                                style={styles.inputView}
                                placeholder="Enter new name..."
                                placeholderTextColor="#4451a3"
                                onChangeText={(text) => setNewName(text)}
                                value={newName}
                            ></TextInput>
                        ) : (
                            <TextInput
                                style={styles.inputView}
                                placeholder="Enter your password..."
                                placeholderTextColor="#4451a3"
                                onChangeText={(text) => setPassword(text)}
                                value={password}
                            ></TextInput>
                        )}
                        <View style={{ flexDirection: "row" }}>
                            <TouchableOpacity style={styles.modalBtn}>
                                <Text
                                    style={styles.modalTextBtn}
                                    onPress={() => {
                                        setShowEditForm(false);
                                        setNewName("");
                                        setPassword("");
                                        setActiveTab("rename");
                                    }}
                                >
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalBtn}>
                                <Text
                                    style={styles.modalTextBtn}
                                    onPress={editRoom}
                                >
                                    Submit
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {showRoomList()}

            {numRoom < 6 && numRoom % 2 == 0 && (
                <TouchableOpacity
                    style={styles.addRoomBtn}
                    onPress={() => {
                        setModalVisible(true);
                    }}
                >
                    <Image
                        style={styles.addRoomLogo}
                        source={require("../assets/add-icon.png")}
                    />
                </TouchableOpacity>
            )}

            <TouchableOpacity
                style={styles.backBtn}
                onPress={() => {
                    navigation.navigate("House Manager", {
                        id: userId,
                        houseId: houseId,
                    });
                }}
            >
                <Image
                    style={styles.backLogo}
                    source={require("../assets/back-icon.png")}
                />
            </TouchableOpacity>
        </View>
    );
};
export default RoomList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0a041b",
        alignItems: "center",
        justifyContent: "center",
    },
    containerModalOn: {
        flex: 1,
        backgroundColor: "#30373f",
        alignItems: "center",
        justifyContent: "center",
        opacity: 0.5,
    },
    roomBtn: {
        width: 120,
        height: 120,
        backgroundColor: "#4451a3",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        margin: 10,
        top: 0,
        left: 0,
    },
    addRoomBtn: {
        width: 120,
        height: 120,
        backgroundColor: "#4451a3",
        borderRadius: 60,
        alignItems: "center",
        justifyContent: "center",
        margin: 10,
    },
    backBtn: {
        width: 120,
        height: 120,
        backgroundColor: "#4451a3",
        borderRadius: 60,
        alignItems: "center",
        justifyContent: "center",
        margin: 40,
    },
    roomLogo: {
        width: 90,
        height: 80,
    },
    addRoomLogo: {
        width: 120,
        height: 120,
    },
    backLogo: {
        width: 127,
        height: 127,
    },
    buttonText: {
        color: "white",
        fontSize: 18,
        maxWidth: 120,
    },
    modalView: {
        marginTop: 260,
        marginLeft: 20,
        marginRight: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#ffffff",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        height: 250,
    },
    dropdownIcon: {
        width: 20,
        height: 20,
    },
    inputView: {
        width: "100%",
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "black",
        color: "black",
        borderRadius: 10,
        height: 50,
        marginTop: 15,
        marginBottom: 15,
        justifyContent: "center",
        paddingLeft: 10,
        paddingRight: 10,
    },
    modalText: {
        marginTop: 15,
        marginBottom: 20,
        textAlign: "center",
        fontSize: 25,
        fontWeight: "bold",
        color: "#4451a3",
    },
    modalBtn: {
        backgroundColor: "white",
        marginLeft: 43,
        marginRight: 44,
        marginTop: 10,
        marginBottom: 10,
        width: 100,
        height: 35,
        borderRadius: 10,
    },
    modalTextBtn: {
        color: "#4451a3",
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 20,
    },
    tabItem: {
        backgroundColor: "white",
        color: "#4451a3",
        fontWeight: "bold",
        fontSize: 20,
        width: "100%",
        padding: 0,
    },
    indicatorTabStyle: {
        backgroundColor: "#4451a3",
        height: 3,
    },
    tabStyle: {
        color: "white",
    },
    editModalView: {
        marginTop: 260,
        marginLeft: 20,
        marginRight: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#ffffff",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        height: 180,
    },
    modalTabBtnActive: {
        backgroundColor: "white",
        marginLeft: 21,
        marginRight: 23,
        marginTop: 30,
        width: 100,
        height: 35,
        borderBottomWidth: 4,
        borderColor: "#4451a3",
    },
    modalTabBtnInactive: {
        backgroundColor: "white",
        marginLeft: 21,
        marginRight: 23,
        marginTop: 30,
        width: 100,
        height: 35,
        borderBottomWidth: 4,
        borderColor: "white",
    },
});
