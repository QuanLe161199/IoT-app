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
    deleteDoc,
} from "firebase/firestore";
import DialogInput from "react-native-dialog-input";

const HouseManager = ({ navigation, route }) => {
    const [userList, setUserList] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [userId, setUserId] = useState("");
    const [houseIdBtn, setHouseIdBtn] = useState("");

    useEffect(async () => {
        setUserId(route.params.id);
        setHouseIdBtn(route.params.houseId);
        updateAccountList(route.params.houseId);
    }, []);

    const updateAccountList = async (houseId) => {
        var users = await getDocs(collection(firestore, "account"));
        var userListAvailable = [];
        users.forEach(async (user) => {
            var checkPoint = false;
            var houseListOfUser = await getDocs(
                collection(firestore, `account/${user.id}/house`)
            );
            if (houseListOfUser) {
                houseListOfUser.forEach((house) => {
                    console.log(house.id);
                    if (house.id == houseId && house.data().role == "member")
                        checkPoint = true;
                });
            }
            if (checkPoint) {
                userListAvailable.push({
                    userId: user.id,
                    userEmail: user.data().email,
                });
                console.log(userListAvailable);
            }
        });
        setTimeout(() => {
            setUserList(userListAvailable);
        }, 1000);
    };

    const addUser = async (text) => {
        var checkPoint = true;
        userList.forEach((user) => {
            if (user.userEmail == text) {
                checkPoint = false;
            }
        });

        if (checkPoint) {
            var emailExist = false;
            var accountId = "";
            var accountEmail = "";
            var accountList = await getDocs(collection(firestore, "account"));
            accountList.forEach(async (account) => {
                if (account.data().email == text) {
                    var housesOwn = await getDocs(
                        collection(firestore, `account/${account.id}/house`)
                    );
                    var i = 0;
                    housesOwn.forEach(() => {
                        i++;
                    });
                    console.log(i);
                    if (i < 6) {
                        emailExist = true;
                        accountId = account.id;
                        accountEmail = account.email;
                    }
                }
            });

            setTimeout(async () => {
                if (emailExist) {
                    await setDoc(
                        doc(
                            firestore,
                            `account/${accountId}/house`,
                            houseIdBtn
                        ),
                        {
                            role: "member",
                        }
                    );
                    var userListAvailable = userList;
                    userListAvailable.push({
                        userId: accountId,
                        userEmail: accountEmail,
                    });
                    setTimeout(() => {
                        updateAccountList(houseIdBtn);
                    }, 1000);
                    setShowDialog(false);
                }
            }, 500);
        }
    };

    const removeUser = async (userId) => {
        await deleteDoc(doc(firestore, `account/${userId}/house`, houseIdBtn));
        updateAccountList(houseIdBtn);
    };

    return (
        <View style={styles.container}>
            <DialogInput
                isDialogVisible={showDialog}
                hintTextColor="#ffffff"
                title={"Member Email"}
                hintInput={"Enter member email"}
                submitInput={(text) => {
                    addUser(text);
                }}
                closeDialog={() => {
                    setShowDialog(false);
                }}
            ></DialogInput>

            <TouchableOpacity style={styles.masterBtn} onPress={() => {}}>
                <Text style={styles.masterText}>quanlv161199@gmail.com</Text>
            </TouchableOpacity>

            {userList?.map((user) => {
                return (
                    <View key={user.userId} style={{ flexDirection: "row" }}>
                        <TouchableOpacity
                            style={styles.memberBtn}
                            onPress={() => {}}
                        >
                            <Text style={styles.memberText}>
                                {user.userEmail}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.trashBtn}
                            onPress={() => {
                                removeUser(user.userId);
                            }}
                        >
                            <Image
                                style={styles.trashLogo}
                                source={require("../assets/trash-can-icon.png")}
                            />
                        </TouchableOpacity>
                    </View>
                );
            })}

            {userList.length < 6 && (
                <TouchableOpacity
                    style={styles.addUserBtn}
                    onPress={() => {
                        setShowDialog(true);
                    }}
                >
                    <Image
                        style={styles.addUserLogo}
                        source={require("../assets/add-icon.png")}
                    />
                </TouchableOpacity>
            )}

            <TouchableOpacity
                style={styles.backBtn}
                onPress={() => {
                    navigation.navigate("House Manager", {
                        id: userId,
                        houseId: houseIdBtn,
                    });
                }}
            >
                <Image
                    style={styles.backLogo}
                    source={require("../assets/back-2-icon.png")}
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
    masterBtn: {
        width: 300,
        height: 50,
        backgroundColor: "#4451a3",
        borderRadius: 60,
        alignItems: "center",
        justifyContent: "center",
        margin: 10,
    },
    masterText: {
        fontSize: 18,
        color: "white",
    },
    memberBtn: {
        width: 245,
        height: 50,
        backgroundColor: "white",
        borderRadius: 60,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
        marginBottom: 10,
        marginRight: 2.5,
    },
    memberText: {
        fontSize: 18,
        color: "#4451a3",
    },
    trashBtn: {
        width: 50,
        height: 50,
        backgroundColor: "#4451a3",
        borderRadius: 60,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 2.5,
    },
    trashLogo: {
        width: 35,
        height: 35,
    },
    backBtn: {
        width: 120,
        height: 50,
        backgroundColor: "#4451a3",
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 40,
    },
    backLogo: { width: 50, height: 45 },
    addUserBtn: {
        width: 50,
        height: 50,
        backgroundColor: "#4451a3",
        borderRadius: 60,
        alignItems: "center",
        justifyContent: "center",
        margin: 10,
    },
    addUserLogo: { width: 55, height: 55 },
    buttonText: {
        color: "black",
        fontSize: 18,
        maxWidth: 120,
    },
});
