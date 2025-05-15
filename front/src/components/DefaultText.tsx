import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";
import { FONTS } from "../constants/fonts";

const DefaultText: React.FC<TextProps> = (props) => {
  const { style, ...otherProps } = props;

  return (
    <Text style={[styles.defaultText, style]} {...otherProps}>
      {props.children}
    </Text>
  );
};

const styles = StyleSheet.create({
  defaultText: {
    fontFamily: FONTS.MILLER_BANNER.ROMAN,
  },
});

export default DefaultText;
