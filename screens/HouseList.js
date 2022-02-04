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
import { Marker, MapView } from "react-native-maps";

const id = "QMjwLtD5eycKwqbEOJQS";

const HouseList = ({ navigation, route }) => {
    const [houseList, setHouseList] = useState([]);
    const [renderScreen, setRenderScreen] = useState(0);
    const [houseNameValid, setHouseNameValid] = useState(true);
    const [showDialog, setShowDialog] = useState(false);

    useEffect(async () => {
        var houseIdList = [];
        var houses = [];
        const querySnapshot = await getDocs(
            collection(firestore, `account/${id}/house`)
        );
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
            houseIdList.push(doc.id);
        });

        if (houseIdList) {
            houseIdList.forEach(async (houseId) => {
                var house = await getDoc(doc(firestore, "house", houseId));
                houses.push({ id: houseId, name: house.data().name });
            });
        }

        setHouseList(houses);
    }, []);

    useEffect(() => {
        setTimeout(() => {
            setRenderScreen(renderScreen + 1);
        }, 500);
    }, [houseList, showDialog]);

    const addHouse = async (text) => {
        if (text.length) {
            const newHouse = await addDoc(
                collection(firestore, `account/${id}/house`),
                {
                    role: "master",
                }
            );

            await setDoc(doc(firestore, "house", newHouse.id), {
                name: text,
            });

            setShowDialog(false);
            var houses = houseList;
            houses.push({
                id: newHouse.id,
                name: text,
            });
            setHouseList(houses);
        }
    };

    const showHouseList = () => {
        if (houseList.length)
            return houseList?.map((house) => {
                return (
                    <View key={house.id} style={{ margin: 10 }}>
                        <TouchableOpacity
                            style={styles.houseBtn}
                            onPress={() => {
                                navigation.navigate("House Manager", {
                                    id: id,
                                    houseId: house.id,
                                });
                            }}
                        >
                            <Image
                                style={styles.houseLogo}
                                source={require("../assets/house-icon.png")}
                            />
                            <Text style={styles.buttonText}>{house.name}</Text>
                        </TouchableOpacity>
                    </View>
                );
            });
    };

    return (
        <View style={styles.container}>
            <DialogInput
                textInputProps={{ autoCorrect: false }}
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

            {houseList.length < 3 && (
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
        backgroundColor: "#30373f",
        alignItems: "center",
        justifyContent: "center",
    },
    houseBtn: {
        width: 120,
        height: 120,
        backgroundColor: "white",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        margin: 10,
    },
    logoutBtn: {
        width: 120,
        height: 80,
        backgroundColor: "#bcbcbc",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 50,
    },
    houseLogo: {
        width: 90,
        height: 80,
    },
    logoutLogo: {
        width: 60,
        height: 60,
    },
    buttonText: {
        color: "black",
        fontSize: 18,
        maxWidth: 120,
    },
});
