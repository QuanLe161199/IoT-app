import React, { useState, useEffect } from "react";
import {
    Text,
    View,
    Image,
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
import DialogInput from "react-native-dialog-input";

const HouseList = ({ navigation, route }) => {
    const [userId, setUserId] = useState("");
    const [numHouse, setNumHouse] = useState(0);
    const [houseList, setHouseList] = useState([]);
    const [renderScreen, setRenderScreen] = useState(0);
    const [houseNameValid, setHouseNameValid] = useState(true);
    const [showDialog, setShowDialog] = useState(false);

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
    }, [houseList, showDialog]);

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

            setShowDialog(false);
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
                                    setShowDialog(true);
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

    return (
        <View style={styles.container}>
            <DialogInput
                isDialogVisible={showDialog}
                hintTextColor="#ffffff"
                title={"House name"}
                hintInput={"Enter your house name"}
                submitInput={(text) => {
                    addHouse(text);
                }}
                closeDialog={() => {
                    setShowDialog(false);
                }}
            ></DialogInput>

            {showHouseList()}

            {numHouse < 6 && numHouse % 2 == 0 && (
                <TouchableOpacity
                    style={styles.houseBtn}
                    onPress={() => {
                        setShowDialog(true);
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
});
