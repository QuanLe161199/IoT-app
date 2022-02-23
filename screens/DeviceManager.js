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
} from "firebase/firestore";
import DropDownPicker from "react-native-dropdown-picker";
import CryptoES from "crypto-es";

const DeviceManager = ({ navigation, route }) => {
    const [userId, setUserId] = useState(route.params.id);
    const [roomId, setRoomId] = useState(route.params.roomId);
    const [deviceList, setDeviceList] = useState([]);
    const [numDevice, setNumDevice] = useState(0);
    const [renderScreen, setRenderScreen] = useState(0);
    const [deviceNameValid, setDeviceNameValid] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [realDeviceNoLinkList, setRealDeviceNoLinkList] = useState([]);
    const [nameDevice, setNameDevice] = useState(null);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const [activeTab, setActiveTab] = useState("rename");
    const [newName, setNewName] = useState("");
    const [password, setPassword] = useState("");
    const [deviceId, setDeviceId] = useState("");

    const updateDeviceList = async () => {
        //get newest device button list
        var deviceListAvailable = [];
        var deviceListPre = [];
        var querySnapshot = await getDocs(collection(firestore, "device"));
        querySnapshot.forEach((snapshot) => {
            if (
                route.params.roomId == snapshot.data().roomId &&
                snapshot.data().linked
            ) {
                var data = snapshot.data();
                data.id = snapshot.id;
                deviceListPre.push(data);
            }
        });
        console.log(deviceListPre);
        setNumDevice(deviceListPre.length);
        var object1,
            object2 = {};
        for (let i = 0; i < deviceListPre.length; i++) {
            if (deviceListPre[i].roomId == roomId && deviceListPre[i].linked) {
                var data = deviceListPre[i];
                data.id = deviceListPre[i].id;
                switch (deviceListPre[i].type) {
                    case "light":
                        data.status == "on"
                            ? (data.icon = require("../assets/light-active-icon.png"))
                            : (data.icon = require("../assets/light-icon.png"));
                        break;
                    case "fan":
                        data.status == "on"
                            ? (data.icon = require("../assets/fan-active-icon.png"))
                            : (data.icon = require("../assets/fan-icon.png"));
                        break;
                    case "tv":
                        data.status == "on"
                            ? (data.icon = require("../assets/tv-active-icon.png"))
                            : (data.icon = require("../assets/tv-icon.png"));
                        break;
                    case "temperature":
                        data.icon = require("../assets/temperature-icon.png");
                        break;
                    case "humidity":
                        data.icon = require("../assets/humidity-icon.png");
                        break;
                }

                if (i % 2 == 0) {
                    object1 = data;
                } else {
                    object2 = data;
                    deviceListAvailable.push([object1, object2]);
                }
            }
        }

        if (deviceListPre.length % 2) deviceListAvailable.push([object1]);
        console.log(deviceListAvailable);

        setDeviceList(deviceListAvailable);

        //get newest real devices aren't linked
        var realDevicesNoLinked = [];
        querySnapshot = await getDocs(collection(firestore, "device"));
        querySnapshot.forEach((snapshot) => {
            if (
                route.params.roomId == snapshot.data().roomId &&
                !snapshot.data().linked
            ) {
                var data = { label: snapshot.data().name, value: snapshot.id };
                switch (snapshot.data().type) {
                    case "light":
                        data.icon = () => (
                            <Image
                                source={require("../assets/light-2-icon.png")}
                                style={styles.dropdownIcon}
                            />
                        );
                        break;
                    case "fan":
                        data.icon = () => (
                            <Image
                                source={require("../assets/fan-2-icon.png")}
                                style={styles.dropdownIcon}
                            />
                        );
                        break;
                    case "tv":
                        data.icon = () => (
                            <Image
                                source={require("../assets/tv-2-icon.png")}
                                style={styles.dropdownIcon}
                            />
                        );
                        break;
                    case "temperature":
                        data.icon = () => (
                            <Image
                                source={require("../assets/temperature-2-icon.png")}
                                style={styles.dropdownIcon}
                            />
                        );
                        break;
                    case "humidity":
                        data.icon = () => (
                            <Image
                                source={require("../assets/humidity-2-icon.png")}
                                style={styles.dropdownIcon}
                            />
                        );
                        break;
                }
                realDevicesNoLinked.push(data);
            }
        });
        setRealDeviceNoLinkList(realDevicesNoLinked);
    };

    useEffect(async () => {
        updateDeviceList();
        console.log(route.params.roomId);
    }, []);

    useEffect(async () => {
        setTimeout(() => {
            updateDeviceList();
        }, 60000);
    });

    useEffect(() => {
        setTimeout(() => {
            setRenderScreen(renderScreen + 1);
        }, 500);
    }, [deviceList, modalVisible]);

    const setStatus = async (deviceId) => {
        const device = await getDoc(doc(firestore, "device", deviceId));
        if (
            device.data().type != "temperature" &&
            device.data().type != "humidity"
        ) {
            var newStatus = "on";
            if (device.data().status == "on") {
                newStatus = "off";
            }

            await setDoc(doc(firestore, "device", deviceId), {
                name: device.data().name,
                type: device.data().type,
                status: newStatus,
                roomId: device.data().roomId,
                linked: device.data().linked,
            });

            updateDeviceList();
        }
    };

    const addDevice = async () => {
        if (value) {
            var device = await getDoc(doc(firestore, "device", value));
            var data = {
                name: nameDevice ? nameDevice : device.data().name,
                type: device.data().type,
                linked: true,
                roomId: device.data().roomId,
            };
            if (device.data().value) {
                data.value = device.data().value;
            } else {
                data.status = device.data().status;
            }
            await setDoc(doc(firestore, "device", value), data);
            setValue(null);
            setNameDevice(null);
            setModalVisible(false);

            updateDeviceList();
        }
    };

    const showDeviceList = () => {
        if (deviceList.length)
            return deviceList?.map((device) => {
                return (
                    <View
                        key={device[0].id}
                        style={{ margin: 10, flexDirection: "row" }}
                    >
                        {device[0].type == "temperature" ||
                        device[0].type == "humidity" ? (
                            <TouchableOpacity
                                TouchableOpacity
                                style={styles.deviceBtn}
                                onPress={() => {
                                    setStatus(device[0].id);
                                }}
                                onLongPress={() => {
                                    setShowEditForm(true);
                                    setDeviceId(device[0].id);
                                }}
                                delayLongPress={500}
                            >
                                <View style={{ flexDirection: "row" }}>
                                    <Image
                                        style={styles.sensorLogo}
                                        source={device[0].icon}
                                    />
                                    <Text style={styles.sensorText}>
                                        {device[0].type == "temperature"
                                            ? `${device[0].value}°C`
                                            : `${device[0].value} %`}
                                    </Text>
                                </View>
                                <Text style={styles.buttonText}>
                                    {device[0].name}
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                TouchableOpacity
                                style={styles.deviceBtn}
                                onPress={() => {
                                    setStatus(device[0].id);
                                }}
                                onLongPress={() => {
                                    setShowEditForm(true);
                                    setDeviceId(device[0].id);
                                }}
                                delayLongPress={500}
                            >
                                <Image
                                    style={styles.deviceLogo}
                                    source={device[0].icon}
                                />
                                <Text style={styles.buttonText}>
                                    {device[0].name}
                                </Text>
                            </TouchableOpacity>
                        )}
                        {device.length == 2 ? (
                            device[1].type == "temperature" ||
                            device[1].type == "humidity" ? (
                                <TouchableOpacity
                                    TouchableOpacity
                                    style={styles.deviceBtn}
                                    onPress={() => {
                                        setStatus(device[1].id);
                                    }}
                                    onLongPress={() => {
                                        setShowEditForm(true);
                                        setDeviceId(device[1].id);
                                    }}
                                    delayLongPress={500}
                                >
                                    <View style={{ flexDirection: "row" }}>
                                        <Image
                                            style={styles.sensorLogo}
                                            source={device[1].icon}
                                        />
                                        <Text style={styles.sensorText}>
                                            {device[1].type == "temperature"
                                                ? `${device[1].value}°C`
                                                : `${device[1].value} %`}
                                        </Text>
                                    </View>
                                    <Text style={styles.buttonText}>
                                        {device[1].name}
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    TouchableOpacity
                                    style={styles.deviceBtn}
                                    onPress={() => {
                                        setStatus(device[1].id);
                                    }}
                                    onLongPress={() => {
                                        setShowEditForm(true);
                                        setDeviceId(device[1].id);
                                    }}
                                    delayLongPress={500}
                                >
                                    <Image
                                        style={styles.deviceLogo}
                                        source={device[1].icon}
                                    />
                                    <Text style={styles.buttonText}>
                                        {device[1].name}
                                    </Text>
                                </TouchableOpacity>
                            )
                        ) : (
                            <TouchableOpacity
                                style={styles.addDeviceBtn}
                                onPress={() => {
                                    setModalVisible(true);
                                }}
                            >
                                <Image
                                    style={styles.addDeviceLogo}
                                    source={require("../assets/add-icon.png")}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                );
            });
    };

    const editDevice = async () => {
        if (activeTab == "rename") {
            console.log(newName);
            console.log(deviceId);
            const device = await getDoc(doc(firestore, "device", deviceId));
            if (
                device.data().type == "temperature" ||
                device.data().type == "humidity"
            ) {
                await setDoc(doc(firestore, "device", deviceId), {
                    name: newName,
                    roomId: device.data().roomId,
                    type: device.data().type,
                    value: device.data().value,
                    linked: device.data().linked,
                });
            } else {
                await setDoc(doc(firestore, "device", deviceId), {
                    name: newName,
                    roomId: device.data().roomId,
                    type: device.data().type,
                    status: device.data().status,
                    linked: device.data().linked,
                });
            }

            setNewName("");
            setShowEditForm(false);
        } else {
            const user = await getDoc(doc(firestore, "account", userId));
            if (user.data().password == CryptoES.SHA256(password).toString()) {
                setShowEditForm(false);
                setActiveTab("rename");

                const device = await getDoc(doc(firestore, "device", deviceId));

                if (device.data().roomId == roomId) {
                    if (
                        device.data().type == "humidity" ||
                        device.data().type == "temperature"
                    ) {
                        setDoc(doc(firestore, "device", device.id), {
                            linked: false,
                            name: device.data().name,
                            roomId: device.data().roomId,
                            type: device.data().type,
                            value: device.data().value,
                        });
                    } else {
                        setDoc(doc(firestore, "device", device.id), {
                            linked: false,
                            name: device.data().name,
                            roomId: device.data().roomId,
                            type: device.data().type,
                            status: device.data().status,
                        });
                    }
                }
            }
            setPassword("");
        }
        updateDeviceList();
    };

    return (
        <View
            style={
                showEditForm || modalVisible
                    ? styles.container2
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
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Add Device</Text>
                        <DropDownPicker
                            style={styles.dropdown}
                            open={open}
                            value={value}
                            items={realDeviceNoLinkList}
                            setOpen={setOpen}
                            setValue={setValue}
                            setItems={setRealDeviceNoLinkList}
                        />
                        <TextInput
                            style={styles.inputView}
                            placeholder="Enter new name..."
                            placeholderTextColor="#4451a3"
                            onChangeText={(text) => setNameDevice(text)}
                        ></TextInput>
                        <View style={{ flexDirection: "row" }}>
                            <TouchableOpacity style={styles.modalBtn}>
                                <Text
                                    style={styles.modalTextBtn}
                                    onPress={() => {
                                        setModalVisible(false);
                                        setValue(null);
                                        setNameDevice(null);
                                    }}
                                >
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalBtn}>
                                <Text
                                    style={styles.modalTextBtn}
                                    onPress={addDevice}
                                >
                                    Submit
                                </Text>
                            </TouchableOpacity>
                        </View>
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
                                    onPress={editDevice}
                                >
                                    Submit
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {showDeviceList()}

            {numDevice < 6 && numDevice % 2 == 0 && (
                <TouchableOpacity
                    style={styles.addDeviceBtn}
                    onPress={() => {
                        setModalVisible(true);
                    }}
                >
                    <Image
                        style={styles.addDeviceLogo}
                        source={require("../assets/add-icon.png")}
                    />
                </TouchableOpacity>
            )}

            <TouchableOpacity
                style={styles.backBtn}
                onPress={() => {
                    navigation.navigate("Room List", {
                        id: userId,
                        roomId: roomId,
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
export default DeviceManager;

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
    deviceBtn: {
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
    addDeviceBtn: {
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
    deviceLogo: {
        width: 80,
        height: 80,
    },
    addDeviceLogo: {
        width: 120,
        height: 120,
    },
    backLogo: {
        width: 127,
        height: 127,
    },
    sensorLogo: {
        width: 60,
        height: 60,
        marginTop: 10,
        marginBottom: 10,
    },
    sensorText: {
        fontSize: 25,
        marginTop: 30,
        color: "white",
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
