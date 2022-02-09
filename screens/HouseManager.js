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

const HouseManager = ({ navigation, route }) => {
    const [userId, setUserId] = useState("");
    const [houseId, setHouseId] = useState("");
    const [role, setRole] = useState("");

    useEffect(async () => {
        setUserId(route.params.id);
        setHouseId(route.params.houseId);

        var house = await getDoc(
            doc(
                firestore,
                `account/${route.params.id}/house`,
                route.params.houseId
            )
        );
        console.log(house);
        setRole(house.data().role);
    }, []);

    return (
        <View style={styles.container}>
            {role == "master" && (
                <TouchableOpacity
                    style={styles.btn}
                    onPress={() => {
                        navigation.navigate("User Manager", {
                            id: userId,
                            houseId: houseId,
                        });
                    }}
                >
                    <Image
                        style={styles.logo}
                        source={require("../assets/user-icon.png")}
                    />
                </TouchableOpacity>
            )}
            <TouchableOpacity
                style={styles.btn}
                onPress={() => {
                    navigation.navigate("Room List", {
                        id: userId,
                        houseId: houseId,
                    });
                }}
            >
                <Image
                    style={styles.logo}
                    source={require("../assets/room-icon.png")}
                />
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.btn}
                onPress={() => {
                    navigation.navigate("House List", { id: doc.id });
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
export default HouseManager;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0a041b",
        alignItems: "center",
        justifyContent: "center",
    },
    btn: {
        width: 120,
        height: 120,
        backgroundColor: "#4451a3",
        borderRadius: 60,
        alignItems: "center",
        justifyContent: "center",
        margin: 20,
    },
    logo: {
        width: 90,
        height: 90,
    },
    buttonText: {
        color: "black",
        fontSize: 18,
        maxWidth: 120,
    },
    backLogo: { width: 127, height: 127 },
});
