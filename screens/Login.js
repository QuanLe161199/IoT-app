import React, { useState, useEffect } from "react";
import {
    Text,
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import firestore from "../firebase-config";
import { collection, getDocs } from "firebase/firestore";
import CryptoES from "crypto-es";

const Login = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorInput, setErrorInput] = useState(false);

    const handleSubmit = async () => {
        var checkPoint = true;
        const querySnapshot = await getDocs(collection(firestore, "account"));
        querySnapshot.forEach((doc) => {
            console.log(doc.id, " => ", doc.data());
            if (
                doc.data().email == email &&
                doc.data().password == CryptoES.SHA256(password).toString()
            ) {
                console.log("login successfully");
                navigation.navigate("House List", { id: doc.id });
                checkPoint = false;
            }
        });
        if (checkPoint) {
            setErrorInput(true);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.logo}>Gigaland</Text>
            <View style={styles.inputView}>
                <TextInput
                    style={
                        errorInput ? styles.errorInputText : styles.inputText
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
                        errorInput ? styles.errorInputText : styles.inputText
                    }
                    placeholder="Password..."
                    placeholderTextColor="#003f5c"
                    onChangeText={(text) => setPassword(text)}
                    value={password}
                />
            </View>
            <TouchableOpacity style={styles.loginBtn} onPress={handleSubmit}>
                <Text style={styles.loginText}>LOGIN</Text>
            </TouchableOpacity>
            <TouchableOpacity>
                <Text
                    style={styles.loginText}
                    onPress={() => navigation.navigate("Sign Up")}
                >
                    SIGNUP
                </Text>
            </TouchableOpacity>
        </View>
    );
};
export default Login;

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
