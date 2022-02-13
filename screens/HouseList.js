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
import { Tab, TabView } from "react-native-elements";
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
import DialogInput from "react-native-dialog-input";
import CryptoES from "crypto-es";

const HouseList = ({ navigation, route }) => {
    const [userId, setUserId] = useState("");
    const [numHouse, setNumHouse] = useState(0);
    const [houseList, setHouseList] = useState([]);
    const [renderScreen, setRenderScreen] = useState(0);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [activeTab, setActiveTab] = useState("rename");
    const [newName, setNewName] = useState("");
    const [password, setPassword] = useState("");
    const [houseId, setHouseId] = useState("");

    useEffect(async () => {
        updateHouseList();
    }, []);

    const updateHouseList = async () => {
        const id = route.params.id;
        setUserId(id);
        var houseIdList = [];
        var houses = [];
        const querySnapshot = await getDocs(
            collection(firestore, `account/${id}/house`)
        );
        var index = 0;
        querySnapshot.forEach((doc) => {
            index++;
            houseIdList.push(doc.id);
        });
        setNumHouse(index);

        if (houseIdList.length) {
            var object1,
                object2 = {};
            for (let i = 0; i < houseIdList.length; i++) {
                var house = await getDoc(
                    doc(firestore, "house", houseIdList[i])
                );
                if (i % 2 == 0) {
                    object1 = {
                        id: house.id,
                        name: house.data().name,
                    };
                } else {
                    object2 = {
                        id: house.id,
                        name: house.data().name,
                    };
                    houses.push([object1, object2]);
                }
            }
            if (houseIdList.length % 2) {
                houses.push([object1]);
            }
        }
        setHouseList(houses);
    };

    useEffect(() => {
        setTimeout(() => {
            setRenderScreen(renderScreen + 1);
        }, 500);
    }, [houseList, showCreateForm]);

    const addHouse = async (text) => {
        if (text.length) {
            const newHouse = await addDoc(
                collection(firestore, `account/${userId}/house`),
                {
                    role: "master",
                }
            );

            await setDoc(doc(firestore, "house", newHouse.id), {
                name: text,
            });

            setShowCreateForm(false);
            updateHouseList();
        }
    };

    const showHouseList = () => {
        if (houseList.length)
            return houseList?.map((house) => {
                return (
                    <View
                        key={house[0].id}
                        style={{ margin: 10, flexDirection: "row" }}
                    >
                        <TouchableOpacity
                            style={styles.houseBtn}
                            onPress={() => {
                                navigation.navigate("House Manager", {
                                    id: userId,
                                    houseId: house[0].id,
                                });
                            }}
                            onLongPress={() => {
                                setShowEditForm(true);
                                setHouseId(house[0].id);
                            }}
                            delayLongPress={500}
                        >
                            <Image
                                style={styles.houseLogo}
                                source={require("../assets/house-icon.png")}
                            />
                            <Text style={styles.buttonText}>
                                {house[0].name}
                            </Text>
                        </TouchableOpacity>

                        {house.length == 2 ? (
                            <TouchableOpacity
                                style={styles.houseBtn}
                                onPress={() => {
                                    navigation.navigate("House Manager", {
                                        id: userId,
                                        houseId: house[1].id,
                                    });
                                }}
                                onLongPress={() => {
                                    setShowEditForm(true);
                                    setHouseId(house[1].id);
                                }}
                                delayLongPress={500}
                            >
                                <Image
                                    style={styles.houseLogo}
                                    source={require("../assets/house-icon.png")}
                                />
                                <Text style={styles.buttonText}>
                                    {house[1].name}
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={styles.houseBtn}
                                onPress={() => {
                                    setShowCreateForm(true);
                                }}
                            >
                                <Image
                                    style={styles.houseLogo}
                                    source={require("../assets/add-house-icon.png")}
                                />
                                <Text style={styles.buttonText}>Add House</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                );
            });
    };

    const editHouse = async () => {
        if (activeTab == "rename") {
            console.log(newName);
            await setDoc(doc(firestore, "house", houseId), {
                name: newName,
            });
            setNewName("");
            setShowEditForm(false);
        } else {
            const user = await getDoc(doc(firestore, "account", userId));
            if (user.data().password == CryptoES.SHA256(password).toString()) {
                await deleteDoc(doc(firestore, "house", houseId));
                setShowEditForm(false);
                setActiveTab("rename");

                //delete house id in the account collection
                const users = await getDocs(collection(firestore, "account"));
                users.forEach(async (user) => {
                    const houses = await getDocs(
                        collection(firestore, `account/${user.id}/house`)
                    );
                    houses.forEach((house) => {
                        if (house.id == houseId) {
                            deleteDoc(
                                doc(
                                    firestore,
                                    `account/${user.id}/house`,
                                    houseId
                                )
                            );
                        }
                    });
                });

                //delete rooms and devices in the house
                const rooms = await getDocs(collection(firestore, "room"));
                var deleteRoomIdList = [];
                rooms.forEach(async (room) => {
                    if (room.data().houseId == houseId) {
                        deleteRoomIdList.push(room.id);
                        await deleteDoc(doc(firestore, "room", room.id));
                    }
                });

                deleteRoomIdList.forEach(async (deleteRoomId) => {
                    const devices = await getDocs(
                        collection(firestore, "device")
                    );
                    devices.forEach((device) => {
                        if (device.data().roomId == deleteRoomId) {
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
                });
            }
            setPassword("");
        }
        updateHouseList();
    };

    return (
        <View style={showEditForm ? styles.container2 : styles.container}>
            {/* create house form */}
            <DialogInput
                isDialogVisible={showCreateForm}
                hintTextColor="#ffffff"
                title={"House name"}
                hintInput={"Enter your house name"}
                submitInput={(text) => {
                    addHouse(text);
                }}
                closeDialog={() => {
                    setShowCreateForm(false);
                }}
            ></DialogInput>

            {/* edit house form */}
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
                                    onPress={editHouse}
                                >
                                    Submit
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {showHouseList()}

            {numHouse < 6 && numHouse % 2 == 0 && (
                <TouchableOpacity
                    style={styles.houseBtn}
                    onPress={() => {
                        setShowCreateForm(true);
                    }}
                >
                    <Image
                        style={styles.houseLogo}
                        source={require("../assets/add-house-icon.png")}
                    />
                    <Text style={styles.buttonText}>Add House</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity
                style={styles.logoutBtn}
                onPress={() => {
                    navigation.navigate("Login");
                }}
            >
                <Image
                    style={styles.logoutLogo}
                    source={require("../assets/logout-icon.png")}
                />
            </TouchableOpacity>
        </View>
    );
};
export default HouseList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0a041b",
        alignItems: "center",
        justifyContent: "center",
    },
    container2: {
        flex: 1,
        backgroundColor: "#30373f",
        alignItems: "center",
        justifyContent: "center",
        opacity: 0.5,
    },
    houseBtn: {
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
    logoutBtn: {
        width: 118,
        height: 118,
        borderRadius: 60,
        backgroundColor: "#4451a3",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 40,
    },
    houseLogo: {
        width: 90,
        height: 80,
    },
    logoutLogo: {
        width: 120,
        height: 120,
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
});
