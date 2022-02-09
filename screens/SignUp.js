import React, { useState, useEffect } from "react";
import {
    Text,
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import firestore from "../firebase-config";
import { collection, getDocs, doc, addDoc } from "firebase/firestore";
import CryptoES from "crypto-es";

const SignUp = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");

    const [emailValid, setEmailValid] = useState(true);
    const [passwordValid, setPasswordValid] = useState(true);

    const handleSubmit = async () => {
        if (password.length && passwordValid && email.length) {
            var emailExist = false;
            const querySnapshot = await getDocs(
                collection(firestore, "account")
            );
            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                if (doc.data().email == email) {
                    emailExist = true;
                }
            });

            if (emailExist) {
                setEmailValid(false);
            } else {
                const hashPassword = CryptoES.SHA256(password).toString();
                await addDoc(collection(firestore, "account"), {
                    email: email,
                    password: hashPassword,
                });
                navigation.navigate("Login");
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.logo}>Gigaland</Text>
            <View style={styles.inputView}>
                <TextInput
                    style={
                        emailValid ? styles.inputText : styles.errorInputText
                    }
                    placeholder="Email..."
                    placeholderTextColor="#003f5c"
                    onChangeText={(text) => setEmail(text)}
                    value={email}
                />
            </View>
            <View style={styles.inputView}>
                <TextInput
                    secureTextEntry
                    style={
                        passwordValid ? styles.inputText : styles.errorInputText
                    }
                    placeholder="Password..."
                    placeholderTextColor="#003f5c"
                    onChangeText={(text) => {
                        setPassword(text);
                        text == rePassword
                            ? setPasswordValid(true)
                            : setPasswordValid(false);
                    }}
                    value={password}
                />
            </View>
            <View style={styles.inputView}>
                <TextInput
                    secureTextEntry
                    style={
                        passwordValid ? styles.inputText : styles.errorInputText
                    }
                    placeholder="Re-Password..."
                    placeholderTextColor="#003f5c"
                    onChangeText={(text) => {
                        setRePassword(text);
                        text == password
                            ? setPasswordValid(true)
                            : setPasswordValid(false);
                    }}
                    value={rePassword}
                />
            </View>
            <TouchableOpacity style={styles.loginBtn} onPress={handleSubmit}>
                <Text style={styles.loginText}>SUBMIT</Text>
            </TouchableOpacity>
            <TouchableOpacity>
                <Text
                    style={styles.loginText}
                    onPress={() => navigation.navigate("Login")}
                >
                    LOGIN
                </Text>
            </TouchableOpacity>
        </View>
    );
};
export default SignUp;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0a041b",
        alignItems: "center",
        justifyContent: "center",
    },
    logo: {
        fontWeight: "bold",
        fontSize: 50,
        color: "#4451a3",
        marginBottom: 40,
    },
    inputView: {
        width: "80%",
        backgroundColor: "#465881",
        borderRadius: 25,
        height: 50,
        marginBottom: 20,
        justifyContent: "center",
        padding: 20,
    },
    inputText: {
        height: 50,
        color: "white",
    },
    errorInputText: {
        height: 50,
        color: "#7b181a",
    },
    forgot: {
        color: "white",
        fontSize: 11,
    },
    loginBtn: {
        width: "80%",
        backgroundColor: "#4451a3",
        borderRadius: 25,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 40,
        marginBottom: 10,
    },
    loginText: {
        color: "white",
    },
});
